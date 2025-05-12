// Test findHomeForChunk.

import {findHomeForChunk} from './backfill.js'
test('Adds a chunk to the end', () => {
  const knownChunks = [{minId: 1, maxId: 3}];
  const pagination = {prev: {args: {since_id: 7}, url: "ignored"}, next: {args: {max_id: 6}, url: "ignored"}};
  const body = "nothing";
  expect(findHomeForChunk(knownChunks, pagination, body)).toStrictEqual([{minId: 1, maxId: 3}, {minId: 6, maxId: 7}]);
});

test('Changes knownChunks by side effect', () => {
  const knownChunks = [{minId: 1, maxId: 3}];
  const pagination = {prev: {args: {since_id: 7}, url: "ignored"}, next: {args: {max_id: 6}, url: "ignored"}};
  const body = "nothing";
  expect(findHomeForChunk(knownChunks, pagination, body)).toStrictEqual([{minId: 1, maxId: 3}, {minId: 6, maxId: 7}]);
  expect(knownChunks).toStrictEqual([{minId: 1, maxId: 3}, {minId: 6, maxId: 7}]);
});

test('Adds a chunk to the beginning', () => {
  const knownChunks = [{minId: 6, maxId: 7}];
  const pagination = {prev: {args: {since_id: 3}, url: "ignored"}, next: {args: {max_id: 1}, url: "ignored"}};
  const body = "nothing";
  expect(findHomeForChunk(knownChunks, pagination, body)).toStrictEqual([{minId: 1, maxId: 3}, {minId: 6, maxId: 7}]);
});

test('Adds a chunk in the middle', () => {
  const knownChunks = [{minId: 1, maxId: 2}, {minId: 7, maxId: 8}];
  const pagination = {prev: {args: {since_id: 5}, url: "ignored"}, next: {args: {max_id: 4}, url: "ignored"}};
  const body = "nothing";
  expect(findHomeForChunk(knownChunks, pagination, body)).toStrictEqual([{minId: 1, maxId: 2}, {minId: 4, maxId: 5}, {minId: 7, maxId: 8}]);
});

test('Adds the only chunk', () => {
  const knownChunks = [];
  const pagination = {prev: {args: {since_id: 5}, url: "ignored"}, next: {args: {max_id: 4}, url: "ignored"}};
  const body = "nothing";
  expect(findHomeForChunk(knownChunks, pagination, body)).toStrictEqual([{minId: 4, maxId: 5}]);
});

test('Expands the last chunk to the left', () => {
  const knownChunks = [{minId: 1, maxId: 2}, {minId: 7, maxId: 8}];
  const pagination = {prev: {args: {since_id: 7}, url: "ignored"}, next: {args: {max_id: 4}, url: "ignored"}};
  const body = "nothing";
  expect(findHomeForChunk(knownChunks, pagination, body)).toStrictEqual([{minId: 1, maxId: 2}, {minId: 4, maxId: 8}]);
});

test('Expands the last chunk to the right', () => {
  const knownChunks = [{minId: 1, maxId: 2}, {minId: 7, maxId: 8}];
  const pagination = {prev: {args: {since_id: 9}, url: "ignored"}, next: {args: {max_id: 7}, url: "ignored"}};
  const body = "nothing";
  expect(findHomeForChunk(knownChunks, pagination, body)).toStrictEqual([{minId: 1, maxId: 2}, {minId: 7, maxId: 9}]);
});

test('Expands the last chunk in both directions', () => {
  const knownChunks = [{minId: 1, maxId: 2}, {minId: 7, maxId: 8}];
  const pagination = {prev: {args: {since_id: 9}, url: "ignored"}, next: {args: {max_id: 6}, url: "ignored"}};
  const body = "nothing";
  expect(findHomeForChunk(knownChunks, pagination, body)).toStrictEqual([{minId: 1, maxId: 2}, {minId: 6, maxId: 9}]);
});

test('Expands the middle chunk in both directions', () => {
  const knownChunks = [{minId: 1, maxId: 2}, {minId: 5, maxId: 6}, {minId: 9, maxId: 10}];
  const pagination = {prev: {args: {since_id: 7}, url: "ignored"}, next: {args: {max_id: 4}, url: "ignored"}};
  const body = "nothing";
  expect(findHomeForChunk(knownChunks, pagination, body)).toStrictEqual([{minId: 1, maxId: 2}, {minId: 4, maxId: 7}, {minId: 9, maxId: 10}]);
});

test('Merge last two chunks', () => {
  const knownChunks = [{minId: 1, maxId: 2}, {minId: 5, maxId: 6}, {minId: 9, maxId: 10}];
  const pagination = {prev: {args: {since_id: 9}, url: "ignored"}, next: {args: {max_id: 6}, url: "ignored"}};
  const body = "nothing";
  expect(findHomeForChunk(knownChunks, pagination, body)).toStrictEqual([{minId: 1, maxId: 2}, {minId: 5, maxId: 10}]);
});

test('Merge first two chunks', () => {
  const knownChunks = [{minId: 1, maxId: 2}, {minId: 5, maxId: 6}, {minId: 9, maxId: 10}];
  const pagination = {prev: {args: {since_id: 5}, url: "ignored"}, next: {args: {max_id: 1}, url: "nothing"}};
  const body = "nothing";
  expect(findHomeForChunk(knownChunks, pagination, body)).toStrictEqual([{minId: 1, maxId: 6}, {minId: 9, maxId: 10}]);
});



// Test backfillIteration.
import {backfillIteration} from './backfill.js'
import MastodonAPI from './mastodon-api-mock.js'

function backfillCallbackFn(accumulator) {
  return (body) => {
    accumulator.push(body);
  };
}

test('Nothing to backfill', async () => {
  const accumulator = [];
  const mastodonApi = new MastodonAPI([[1, 3]], true);
  const knownChunks = [{minId: 1, maxId: 3}];
  await backfillIteration({knownChunks, mastodonApi, apiUrl: '/', limit: undefined, callback: backfillCallbackFn(accumulator)});

  expect(accumulator).toStrictEqual([[{id: 1}]]);
  expect(knownChunks).toStrictEqual([{minId: 1, maxId: 3}]);
});

test('Api doesn\'t support pagination', async () => {
  const accumulator = [];
  const mastodonApi = new MastodonAPI([[1, 3]], false);
  const knownChunks = [{minId: 1, maxId: 3}];
  await backfillIteration({knownChunks, mastodonApi, apiUrl: '/', limit: undefined, callback: backfillCallbackFn(accumulator)});

  expect(accumulator).toStrictEqual([[{id: 1}]]);
});

test('Backfill a whole bunch', async () => {
  const accumulator = [];
  const mastodonApi = new MastodonAPI([[1, 80]], true);
  const knownChunks = [{minId: 40, maxId: 80}];
  await backfillIteration({knownChunks, mastodonApi, apiUrl: '/', limit: 40, callback: backfillCallbackFn(accumulator)});

  const fortyThings = [...Array(40).keys()].toReversed().map(i => {return {id: i+1};});
  expect(accumulator).toStrictEqual([fortyThings]);
});

test('Change knownChunks by side effect', async () => {
  const accumulator = [];
  const mastodonApi = new MastodonAPI([[1, 80]], true);
  const knownChunks = [{minId: 40, maxId: 80}];
  await backfillIteration({knownChunks, mastodonApi, apiUrl: '/', limit: 40, callback: backfillCallbackFn(accumulator)});

  const fortyThings = [...Array(40).keys()].toReversed().map(i => {return {id: i+1};});
  expect(accumulator).toStrictEqual([fortyThings]);
  expect(knownChunks).toStrictEqual([{minId: 1, maxId: 80}]);
});

test('Backfill multiple non-contiguous areas', async () => {
  const accumulator = [];
  const mastodonApi = new MastodonAPI([[1, 160]], true);
  const knownChunks = [{minId: 40, maxId: 80}, {minId: 120, maxId: 160}];
  await backfillIteration({knownChunks, mastodonApi, apiUrl: '/', limit: 40, callback: backfillCallbackFn(accumulator)});

  const firstFortyThings = [...Array(40).keys()].toReversed().map(i => {return {id: i+1};});
  const thirdFortyThings = [...firstFortyThings].map(i => {return {id: i.id + 80};});
  expect(accumulator).toContainEqual(firstFortyThings);
  expect(accumulator).toContainEqual(thirdFortyThings);
});

test('Backfill multiple non-contiguous areas (pagination)', async () => {
  const accumulator = [];
  const mastodonApi = new MastodonAPI([[1, 160]], true);
  const knownChunks = [{minId: 40, maxId: 80}, {minId: 120, maxId: 160}];
  await backfillIteration({knownChunks, mastodonApi, apiUrl: '/', limit: 40, callback: backfillCallbackFn(accumulator)});

  const firstFortyThings = [...Array(40).keys()].toReversed().map(i => {return {id: i+1};});
  const thirdFortyThings = [...firstFortyThings].map(i => {return {id: i.id + 80};});
  expect(accumulator).toContainEqual(firstFortyThings);
  expect(accumulator).toContainEqual(thirdFortyThings);
});
