import MastodonAPI from './mastodon-api-mock.js'

test('Returns a singleton (minId)', async () => {
  const mastodonApi = new MastodonAPI([[1, 1]], false);
  expect(await mastodonApi.apiGet('/', {minId: 1, limit: 40})).toStrictEqual([{id: 1}]);
});

test('Returns a non-singleton (minId)', async () => {
  const mastodonApi = new MastodonAPI([[1, 5]], false);
  expect(await mastodonApi.apiGet('/', {minId: 1, limit: 40})).toStrictEqual([{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}]);
});

test('Returns items from separate data ranges (minId)', async () => {
  const mastodonApi = new MastodonAPI([[1, 3], [6, 8]], false);
  expect(await mastodonApi.apiGet('/', {minId: 1, limit: 40})).toStrictEqual([{id: 1}, {id: 2}, {id: 3}, {id: 6}, {id: 7}, {id: 8}]);
});

test('Only returns things >= minId (minId)', async () => {
  const mastodonApi = new MastodonAPI([[1, 3]], false);
  expect(await mastodonApi.apiGet('/', {minId: 2, limit: 40})).toStrictEqual([{id: 2}, {id: 3}]);
});

test('Stops at limit (minId)', async () => {
  const mastodonApi = new MastodonAPI([[1, 5]], false);
  expect(await mastodonApi.apiGet('/', {minId: 1, limit: 3})).toStrictEqual([{id: 1}, {id: 2}, {id: 3}]);
});

test('Stops at limit even while crossing dataRanges (minId)', async () => {
  const mastodonApi = new MastodonAPI([[1, 2], [4, 9]], false);
  expect(await mastodonApi.apiGet('/', {minId: 1, limit: 4})).toStrictEqual([{id: 1}, {id: 2}, {id: 4}, {id: 5}]);
});

test('Returns a singleton (maxId)', async () => {
  const mastodonApi = new MastodonAPI([[1, 1]], false);
  expect(await mastodonApi.apiGet('/', {maxId: 2, limit: 40})).toStrictEqual([{id: 1}]);
});

test('Returns a non-singleton (maxId)', async () => {
  const mastodonApi = new MastodonAPI([[1, 5]], false);
  expect(await mastodonApi.apiGet('/', {maxId: 9, limit: 40})).toStrictEqual([{id: 5}, {id: 4}, {id: 3}, {id: 2}, {id: 1}]);
});

test('Returns items from separate data ranges (maxId)', async () => {
  const mastodonApi = new MastodonAPI([[1, 3], [6, 8]], false);
  expect(await mastodonApi.apiGet('/', {maxId: 9, limit: 40})).toStrictEqual([{id: 8}, {id: 7}, {id: 6}, {id: 3}, {id: 2}, {id: 1}]);
});

test('Only returns things <= maxId (maxId)', async () => {
  const mastodonApi = new MastodonAPI([[1, 3]], false);
  expect(await mastodonApi.apiGet('/', {maxId: 2, limit: 40})).toStrictEqual([{id: 2}, {id: 1}]);
});

test('Stops at limit (maxId)', async () => {
  const mastodonApi = new MastodonAPI([[1, 5]], false);
  expect(await mastodonApi.apiGet('/', {maxId: 9, limit: 3})).toStrictEqual([{id: 5}, {id: 4}, {id: 3}]);
});

test('Stops at limit even while crossing dataRanges (maxId)', async () => {
  const mastodonApi = new MastodonAPI([[1, 6], [8, 9]], false);
  expect(await mastodonApi.apiGet('/', {maxId: 9, limit: 4})).toStrictEqual([{id: 9}, {id: 8}, {id: 6}, {id: 5}]);
});



// Now the paginated version of all that!
test('Returns a singleton (minId) (paginated)', async () => {
  const mastodonApi = new MastodonAPI([[1, 1]], true);
  expect(await mastodonApi.apiGet('/', {minId: 1, limit: 40})).toStrictEqual({
    pagination: {prev: 'https://localhost/?since_id=1'}, 
    body: [{id: 1}]
  });
});

test('Returns a non-singleton (minId) (paginated)', async () => {
  const mastodonApi = new MastodonAPI([[1, 5]], true);
  expect(await mastodonApi.apiGet('/', {minId: 1, limit: 40})).toStrictEqual({
    pagination: {prev: 'https://localhost/?since_id=5'},
    body: [{id: 1}, {id: 2}, {id: 3}, {id: 4}, {id: 5}],
  });
});

test('Returns items from separate data ranges (minId) (paginated)', async () => {
  const mastodonApi = new MastodonAPI([[1, 3], [6, 8]], true);
  expect(await mastodonApi.apiGet('/', {minId: 1, limit: 40})).toStrictEqual({
    pagination: {prev: 'https://localhost/?since_id=8'},
    body: [{id: 1}, {id: 2}, {id: 3}, {id: 6}, {id: 7}, {id: 8}],
  });
});

test('Only returns things >= minId (minId) (paginated)', async () => {
  const mastodonApi = new MastodonAPI([[1, 3]], true);
  expect(await mastodonApi.apiGet('/', {minId: 2, limit: 40})).toStrictEqual({
    pagination: {
      prev: 'https://localhost/?since_id=3', 
      next: 'https://localhost/?max_id=2'
    },
    body: [{id: 2}, {id: 3}],
  });

});

test('Stops at limit (minId) (paginated)', async () => {
  const mastodonApi = new MastodonAPI([[1, 5]], true);
  expect(await mastodonApi.apiGet('/', {minId: 1, limit: 3})).toStrictEqual({
    pagination: {
      prev: 'https://localhost/?min_id=3', 
    },
    body: [{id: 1}, {id: 2}, {id: 3}],
  });
});

test('Stops at limit even while crossing dataRanges (minId) (paginated)', async () => {
  const mastodonApi = new MastodonAPI([[1, 2], [4, 9]], true);
  expect(await mastodonApi.apiGet('/', {minId: 1, limit: 4})).toStrictEqual({
    pagination: {
      prev: 'https://localhost/?min_id=5',
    },
    body: [{id: 1}, {id: 2}, {id: 4}, {id: 5}],
  });
});

test('Returns a singleton (maxId) (paginated)', async () => {
  const mastodonApi = new MastodonAPI([[1, 1]], true);
  expect(await mastodonApi.apiGet('/', {maxId: 2, limit: 40})).toStrictEqual({
    pagination: {
      prev: 'https://localhost/?since_id=1',
    },
    body: [{id: 1}]
  });
});

test('Returns a non-singleton (maxId) (paginated)', async () => {
  const mastodonApi = new MastodonAPI([[1, 5]], true);
  expect(await mastodonApi.apiGet('/', {maxId: 9, limit: 40})).toStrictEqual({
    pagination: {
      prev: 'https://localhost/?since_id=5',
    },
    body: [{id: 5}, {id: 4}, {id: 3}, {id: 2}, {id: 1}]
  });
});

test('Returns items from separate data ranges (maxId) (paginated)', async () => {
  const mastodonApi = new MastodonAPI([[1, 3], [6, 8]], true);
  expect(await mastodonApi.apiGet('/', {maxId: 9, limit: 40})).toStrictEqual({
    pagination: {
      prev: 'https://localhost/?since_id=8',
    },
    body: [{id: 8}, {id: 7}, {id: 6}, {id: 3}, {id: 2}, {id: 1}],
  });
});

test('Only returns things <= maxId (maxId) (paginated)', async () => {
  const mastodonApi = new MastodonAPI([[1, 3]], true);
  expect(await mastodonApi.apiGet('/', {maxId: 2, limit: 40})).toStrictEqual({
    pagination: {
      prev: 'https://localhost/?min_id=2',
    },
    body: [{id: 2}, {id: 1}]
  });
});

test('Stops at limit (maxId) (paginated)', async () => {
  const mastodonApi = new MastodonAPI([[1, 5]], true);
  expect(await mastodonApi.apiGet('/', {maxId: 9, limit: 3})).toStrictEqual({
    pagination: {
      prev: 'https://localhost/?since_id=5',
      next: 'https://localhost/?max_id=3',
    },
    body: [{id: 5}, {id: 4}, {id: 3}],
  });
});

test('Stops at limit even while crossing dataRanges (maxId) (paginated)', async () => {
  const mastodonApi = new MastodonAPI([[1, 6], [8, 9]], true);
  expect(await mastodonApi.apiGet('/', {maxId: 9, limit: 4})).toStrictEqual({
    pagination: {
      prev: 'https://localhost/?since_id=9',
      next: 'https://localhost/?max_id=5',
    },
    body: [{id: 9}, {id: 8}, {id: 6}, {id: 5}],
  });
});
