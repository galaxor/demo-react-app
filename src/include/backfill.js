export function backfillIteration({chunkSource, mastodonApi, apiUrl, limit, callback}) {
  const parallellism = 3;

  const knownChunks = [...chunkSource];

  const promises = [];

  const deletedChunks = [];

  for (const chunkIndex in knownChunks) {
    const {maxId, minId} = knownChunks[chunkIndex];

    // Get some pages that have lower ids than the minimum one we know of in
    // this chunk.
    // How many chunks should we get?  That's defined in the parallellism
    // variable.  We might get, for example, three pages below this, but that
    // might collide with some stuff we already know about.
    const params = {
      limit: limit,
      maxId: minId,
    };

    for (var i=0; i<parallellism; i++) {
      params.skip = i * limit;
      promises.push(
        mastodonApi.apiGet(apiUrl, params, {parsePaginationLinkHeader: true}).then(async ({pagination, body}) => {
          // Make sure the data is actually taken up before we update our
          // records of what's known.
          await callback(body);

          // Update our records of what's known.
          return await findHomeForChunk(chunkSource, pagination, body);
        })
      );
    }
  }

  return promises;
}


export function findHomeForChunk(chunkSource, pagination, body) {
  const newChunk = {
    maxId: pagination.prev.sinceId,
    minId: pagination.next.maxId,
  };

  // Update the chunks.
  // We'll go through the known chunks -- but not the copy we're using
  // for this loop, we're going back to the source.  If we have chunks
  // that overlap, merge them.
  // Note that `knownChunks` is a shallow copy of `chunkSource`.
  // Mutating chunkSource won't mutate knownChunks. But mutating any of
  // the chunks will mutate them in the copy.  That's okay.  If we end
  // up finishing a processing a chunk before we're done dispatching,
  // then we'll be happy we allowed the chunks to mutate, because that
  // will cut down on duplicated fetches.

  // Traverse the chunks backward so that if we delete any chunks, it
  // doesn't mess with the indexes of subsequent chunks.
  for (var chunkSourceIndex=chunkSource.length-1; chunkSourceIndex>=0; chunkSourceIndex--) {
    var replaced = false;
    if (chunkSource[chunkSourceIndex].maxId >= newChunk.minId 
        && chunkSource[chunkSourceIndex].minId <= newChunk.maxId)
    {
      // The chunk we're testing overlaps the new chunk.
      newChunk.minId = Math.min(chunkSource[chunkSourceIndex].minId, newChunk.minId);
      newChunk.maxId = Math.max(chunkSource[chunkSourceIndex].maxId, newChunk.maxId);
      replaced = true;
    }

    // If we replaced, let's delete the old chunk and try the next old
    // chunk.
    if (replaced) {
      chunkSource.splice(chunkSourceIndex, 1);
    } else {
      // If we didn't replace a chunk:
      // If the new chunk should be after this one, splice it into
      // chunkSource after this chunk and stop this loop:  We've placed
      // the new chunk.
      if (chunkSource[chunkSourceIndex].minId < newChunk.maxId) {
        chunkSource.splice(chunkSourceIndex+1, 0, newChunk);
        break;
      }

      // If the new chunk should be before this one, keep looking for its
      // home.
    }
  }

  return chunkSource;
}
