// Test findHomeForChunk.

import {findHomeForChunk} from './backfill.js'
test('Adds a chunk to the end', () => {
  const knownChunks = [{minId: 1, maxId: 3}];
  const pagination = {prev: {sinceId: 7}, next: {maxId: 6}};
  const body = "nothing";
  expect(findHomeForChunk(knownChunks, pagination, body)).toStrictEqual([{minId: 1, maxId: 3}, {minId: 6, maxId: 7}]);
});

test('Adds a chunk to the beginning', () => {
  const knownChunks = [{minId: 6, maxId: 7}];
  const pagination = {prev: {sinceId: 3}, next: {maxId: 1}};
  const body = "nothing";
  expect(findHomeForChunk(knownChunks, pagination, body)).toStrictEqual([{minId: 1, maxId: 3}, {minId: 6, maxId: 7}]);
});

test('Adds a chunk in the middle', () => {
  const knownChunks = [{minId: 1, maxId: 2}, {minId: 7, maxId: 8}];
  const pagination = {prev: {sinceId: 5}, next: {maxId: 4}};
  const body = "nothing";
  expect(findHomeForChunk(knownChunks, pagination, body)).toStrictEqual([{minId: 1, maxId: 2}, {minId: 4, maxId: 5}, {minId: 7, maxId: 8}]);
});

test('Adds the only chunk', () => {
  const knownChunks = [];
  const pagination = {prev: {sinceId: 5}, next: {maxId: 4}};
  const body = "nothing";
  expect(findHomeForChunk(knownChunks, pagination, body)).toStrictEqual([{minId: 4, maxId: 5}]);
});

test('Expands the last chunk to the left', () => {
  const knownChunks = [{minId: 1, maxId: 2}, {minId: 7, maxId: 8}];
  const pagination = {prev: {sinceId: 7}, next: {maxId: 4}};
  const body = "nothing";
  expect(findHomeForChunk(knownChunks, pagination, body)).toStrictEqual([{minId: 1, maxId: 2}, {minId: 4, maxId: 8}]);
});

test('Expands the last chunk to the right', () => {
  const knownChunks = [{minId: 1, maxId: 2}, {minId: 7, maxId: 8}];
  const pagination = {prev: {sinceId: 9}, next: {maxId: 7}};
  const body = "nothing";
  expect(findHomeForChunk(knownChunks, pagination, body)).toStrictEqual([{minId: 1, maxId: 2}, {minId: 7, maxId: 9}]);
});

test('Expands the last chunk in both directions', () => {
  const knownChunks = [{minId: 1, maxId: 2}, {minId: 7, maxId: 8}];
  const pagination = {prev: {sinceId: 9}, next: {maxId: 6}};
  const body = "nothing";
  expect(findHomeForChunk(knownChunks, pagination, body)).toStrictEqual([{minId: 1, maxId: 2}, {minId: 6, maxId: 9}]);
});

test('Expands the middle chunk in both directions', () => {
  const knownChunks = [{minId: 1, maxId: 2}, {minId: 5, maxId: 6}, {minId: 9, maxId: 10}];
  const pagination = {prev: {sinceId: 7}, next: {maxId: 4}};
  const body = "nothing";
  expect(findHomeForChunk(knownChunks, pagination, body)).toStrictEqual([{minId: 1, maxId: 2}, {minId: 4, maxId: 7}, {minId: 9, maxId: 10}]);
});

test('Merge last two chunks', () => {
  const knownChunks = [{minId: 1, maxId: 2}, {minId: 5, maxId: 6}, {minId: 9, maxId: 10}];
  const pagination = {prev: {sinceId: 9}, next: {maxId: 6}};
  const body = "nothing";
  expect(findHomeForChunk(knownChunks, pagination, body)).toStrictEqual([{minId: 1, maxId: 2}, {minId: 5, maxId: 10}]);
});

test('Merge first two chunks', () => {
  const knownChunks = [{minId: 1, maxId: 2}, {minId: 5, maxId: 6}, {minId: 9, maxId: 10}];
  const pagination = {prev: {sinceId: 5}, next: {maxId: 1}};
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
  const knownChunks = [[1,3]];
  await backfillIteration({knownChunks, mastodonApi, apiUrl: '/', limit: undefined, callback: backfillCallbackFn(accumulator)});

  expect(accumulator).toStrictEqual([[{id: 1}]]);
});

test('Api doesn\'t support pagination', async () => {
  const accumulator = [];
  const mastodonApi = new MastodonAPI([[1, 3]], false);
  const knownChunks = [[1,3]];
  await backfillIteration({knownChunks, mastodonApi, apiUrl: '/', limit: undefined, callback: backfillCallbackFn(accumulator)});

  expect(accumulator).toStrictEqual([[{id: 1}]]);
});

test('Backfill a whole bunch', async () => {
  const accumulator = [];
  const mastodonApi = new MastodonAPI([[1, 80]], false);
  const knownChunks = [[40, 80]];
  await backfillIteration({knownChunks, mastodonApi, apiUrl: '/', limit: 40, callback: backfillCallbackFn(accumulator)});

  const fortyThings = [...Array(40).keys()].toReversed().map(i => {return {id: i+1};});
  expect(accumulator).toStrictEqual([fortyThings]);
});
