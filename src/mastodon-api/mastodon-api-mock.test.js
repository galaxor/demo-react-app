import MastodonAPI from './mastodon-api-mock.js'

test('Returns a singleton', async () => {
  const mastodonApi = new MastodonAPI([[1, 1]], false);
  expect(await mastodonApi.apiGet('/', {minId: 1, limit: 40})).toStrictEqual([{id: 1}]);
});
