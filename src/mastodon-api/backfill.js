export function backfillIteration({knownChunks, mastodonApi, apiUrl, limit, callback}) {
  const promises = [];

  const deletedChunks = [];

  for (const chunkIndex in knownChunks) {
    const [minId, maxId] = knownChunks[chunkIndex];

    // Get some pages that have lower ids than the minimum one we know of in
    // this chunk.
    // How many chunks should we get?  That's defined in the parallellism
    // variable.  We might get, for example, three pages below this, but that
    // might collide with some stuff we already know about.
    const params = {
      limit: limit,
      maxId: minId,
    };

    promises.push(
      mastodonApi.apiGet(apiUrl, params, {parsePaginationLinkHeader: true}).then(async (response) => {
        const {pagination, body} = response;

        // Make sure the data is actually taken up before we update our
        // records of what's known.
        await callback(body);

        // Update our records of what's known.
        return await findHomeForChunk(knownChunks, pagination, body);
      })
    );
  }

  return promises;
}


export function findHomeForChunk(knownChunks, pagination, body) {
  const newChunk = {
    // How do we figure out the largest and smallest ids in the result we got
    // from the API?
    // If we're at the most-recent page, Mastodon will usually say that the
    // previous page has a "sinceId", so that if we try to find the previous
    // page, it'll give us the stuff that's new since we last looked.
    // If we're not at the most-recent page, the prev page will usually have a
    // "minId", saying "give me all the stuff with this id or lower".
    // But some calls don't even return pagination.  In that case, we have to
    // look at what got returned to us to figure out what the max and min ids
    // are in the results.  Hopefully, they're all at ".id"
    // Similar for the min id, but we don't have the "since" option.
    maxId: pagination?.prev?.sinceId
        ?? pagination?.prev?.minId 
        ?? body.reduce((max, item) => Math.max(max, item.id)),
    minId: pagination?.next?.maxId
        ?? body.reduce((min, item) => Math.min(min, item.id)),
  };

  // Update the chunks.
  // We'll go through the known chunks -- but not the copy we're using
  // for this loop, we're going back to the source.  If we have chunks
  // that overlap, merge them.
  // Note that mutating any of the chunks will mutate them for all subsequent
  // calls to findHomeForChunks.  That's okay.  If we end up finishing a
  // processing a chunk before we're done dispatching, then we'll be happy we
  // allowed the chunks to mutate, because that will cut down on duplicated
  // fetches.

  // Traverse the chunks backward so that if we delete any chunks, it
  // doesn't mess with the indexes of subsequent chunks.
  var knownChunksIndex;
  var placed = false;
  for (knownChunksIndex=knownChunks.length-1; knownChunksIndex>=0; knownChunksIndex--) {
    var replaced = false;
    if (knownChunks[knownChunksIndex].maxId >= newChunk.minId 
        && knownChunks[knownChunksIndex].minId <= newChunk.maxId)
    {
      // The chunk we're testing overlaps the new chunk.
      newChunk.minId = Math.min(knownChunks[knownChunksIndex].minId, newChunk.minId);
      newChunk.maxId = Math.max(knownChunks[knownChunksIndex].maxId, newChunk.maxId);
      replaced = true;
    }

    // If we replaced, let's delete the old chunk and try the next old
    // chunk.
    if (replaced) {
      knownChunks.splice(knownChunksIndex, 1);
    } else {
      // If we didn't replace a chunk:
      // If the new chunk should be after this one, splice it into
      // knownChunks after this chunk and stop this loop:  We've placed
      // the new chunk.
      if (knownChunks[knownChunksIndex].minId < newChunk.maxId) {
        knownChunks.splice(knownChunksIndex+1, 0, newChunk);
        placed = true;
        break;
      }

      // If the new chunk should be before this one, keep looking for its
      // home.
    }
  }

  if (placed === false) {
    // We made it all the way through without finding a chunk that the new
    // chunk goes after.  That must mean the new chunk goes at the beginning.
    knownChunks.unshift(newChunk);
  }

  return knownChunks;
}
