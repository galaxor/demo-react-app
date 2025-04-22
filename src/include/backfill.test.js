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

test('Adds a chunk in the middle', () => {
  const chunkSource = [{minId: 1, maxId: 2}, {minId: 7, maxId: 8}];
  const pagination = {prev: {sinceId: 5}, next: {maxId: 4}};
  const body = "nothing";
  expect(findHomeForChunk(chunkSource, pagination, body)).toStrictEqual([{minId: 1, maxId: 2}, {minId: 4, maxId: 5}, {minId: 7, maxId: 8}]);
});

test('Adds the only chunk', () => {
  const chunkSource = [];
  const pagination = {prev: {sinceId: 5}, next: {maxId: 4}};
  const body = "nothing";
  expect(findHomeForChunk(chunkSource, pagination, body)).toStrictEqual([{minId: 4, maxId: 5}]);
});

test('Expands the last chunk to the left', () => {
  const chunkSource = [{minId: 1, maxId: 2}, {minId: 7, maxId: 8}];
  const pagination = {prev: {sinceId: 7}, next: {maxId: 4}};
  const body = "nothing";
  expect(findHomeForChunk(chunkSource, pagination, body)).toStrictEqual([{minId: 1, maxId: 2}, {minId: 4, maxId: 8}]);
});

test('Expands the last chunk to the right', () => {
  const chunkSource = [{minId: 1, maxId: 2}, {minId: 7, maxId: 8}];
  const pagination = {prev: {sinceId: 9}, next: {maxId: 7}};
  const body = "nothing";
  expect(findHomeForChunk(chunkSource, pagination, body)).toStrictEqual([{minId: 1, maxId: 2}, {minId: 7, maxId: 9}]);
});

test('Expands the last chunk in both directions', () => {
  const chunkSource = [{minId: 1, maxId: 2}, {minId: 7, maxId: 8}];
  const pagination = {prev: {sinceId: 9}, next: {maxId: 6}};
  const body = "nothing";
  expect(findHomeForChunk(chunkSource, pagination, body)).toStrictEqual([{minId: 1, maxId: 2}, {minId: 6, maxId: 9}]);
});

test('Expands the middle chunk in both directions', () => {
  const chunkSource = [{minId: 1, maxId: 2}, {minId: 5, maxId: 6}, {minId: 9, maxId: 10}];
  const pagination = {prev: {sinceId: 7}, next: {maxId: 4}};
  const body = "nothing";
  expect(findHomeForChunk(chunkSource, pagination, body)).toStrictEqual([{minId: 1, maxId: 2}, {minId: 4, maxId: 7}, {minId: 9, maxId: 10}]);
});

test('Merge last two chunks', () => {
  const chunkSource = [{minId: 1, maxId: 2}, {minId: 5, maxId: 6}, {minId: 9, maxId: 10}];
  const pagination = {prev: {sinceId: 9}, next: {maxId: 6}};
  const body = "nothing";
  expect(findHomeForChunk(chunkSource, pagination, body)).toStrictEqual([{minId: 1, maxId: 2}, {minId: 5, maxId: 10}]);
});

test('Merge first two chunks', () => {
  const chunkSource = [{minId: 1, maxId: 2}, {minId: 5, maxId: 6}, {minId: 9, maxId: 10}];
  const pagination = {prev: {sinceId: 5}, next: {maxId: 1}};
  const body = "nothing";
  expect(findHomeForChunk(chunkSource, pagination, body)).toStrictEqual([{minId: 1, maxId: 6}, {minId: 9, maxId: 10}]);
});
