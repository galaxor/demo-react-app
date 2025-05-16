export async function backfillAll({knownChunks, mastodonApi, apiUrl, limit, callback}) {
  var knownBefore = structuredClone(knownChunks);

  // Put the initial stuff into the promises array.
  var promises = backfillIteration({knownChunks, mastodonApi, apiUrl, limit, callback, returnPromises: true});

  // Each promise needs a counter so we know how to remove it when it resolves.
  var promiseCounter = promises.length;

  // We're going to keep going until we are out of promises -- no more work to do.
  // When one of these promises resolves, we remove it from the array.  If it
  // contained new things we hadn't heard of before, then we initiate another
  // backfillIteration.  If we didn't learn anything new from the results, then
  // we don't push any new work on the queue.
  // How do we know if we learned anything?  We took a snapshot of what
  // knownChunks looked like before we started doing any work.  If it's changed
  // now, then we know we learned something.
  while (promises.length > 0) {
    const justPromises = promises.map(([promiseId, promise]) => promise);

    const [resolvedPromiseId, knownAfter] = await Promise.race(justPromises);

    promises = promises.filter(([promiseId, promise]) => promiseId !== resolvedPromiseId);

    if (!knownChunksEqual(knownBefore, knownAfter)) {
      knownBefore = structuredClone(knownAfter);
      const newPromises = backfillIteration({knownChunks, mastodonApi, apiUrl, limit, callback, returnPromises: true, promiseIdStart: promiseCounter});
      promises.push(...newPromises);
      promiseCounter += newPromises.length;
    }
  }
}

export function backfillIteration({knownChunks, mastodonApi, apiUrl, limit, callback, returnPromises, promiseIdStart}) {
  const promises = [];

  const deletedChunks = [];

  for (const chunkIndex in knownChunks) {
    const {minId, maxId} = knownChunks[chunkIndex];

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
        const retVal = await findHomeForChunk(knownChunks, pagination, body);
        return retVal;
      })
    );
  }

  if (!(returnPromises ?? false)) {
    return Promise.all(promises);
  } else {
    // The resolution of each promise needs to contain an id so I can find it and take it out of
    // the list when it resolves.
    // The promise itself also needs to be packed in a pair so I can find the
    // promise to remove it without checking if it's resolved or not.
    for (var i=0; i<promises.length; i++) {
      const promiseId = (promiseIdStart ?? 0) + i;
      promises[i] = [promiseId, promises[i].then((resolution) => [promiseId, resolution])];
    }
    return promises;
  }
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
    maxId: pagination?.prev?.args?.since_id
        ?? pagination?.prev?.args?.min_id 
        ?? body.reduce((max, item) => Math.max(max, item.id), 0),
    minId: pagination?.next?.args?.max_id
        ?? body.reduce((min, item) => Math.min(min, item.id), Number.MAX_SAFE_INTEGER),
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

function knownChunksEqual(before, after) {
  if (before.length !== after.length) {
    return false;
  }

  for (var i=0; i<before.length; i++) {
    if (before[i].minId !== after[i].minId
       || before[i].maxId !== after[i].maxId)
    {
      return false;
    }
  }

  return true;
}
