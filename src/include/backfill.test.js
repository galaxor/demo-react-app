import {findHomeForChunk} from './backfill.js'

test('Adds a chunk to the end', () => {
  const chunkSource = [{minId: 1, maxId: 3}];
  const pagination = {prev: {sinceId: 7}, next: {maxId: 6}};
  const body = "nothing";
  expect(findHomeForChunk(chunkSource, pagination, body)).toStrictEqual([{minId: 1, maxId: 3}, {minId: 6, maxId: 7}]);
});

test('Adds a chunk to the beginning', () => {
  const chunkSource = [{minId: 6, maxId: 7}];
  const pagination = {prev: {sinceId: 3}, next: {maxId: 1}};
  const body = "nothing";
  expect(findHomeForChunk(chunkSource, pagination, body)).toStrictEqual([{minId: 1, maxId: 3}, {minId: 6, maxId: 7}]);
});
