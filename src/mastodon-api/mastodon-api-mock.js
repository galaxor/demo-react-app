// A mock implementation for testing.
export default class MastodonAPI {
  // Give the data ranges as, like:  [[1, 4], [9, 26]].  The apiGet will return
  // [{id: 1}, {id: 2}, ... {id: 4}] and also 9-26.
  // It will respect minId, maxId, sinceId, and limit.
  // It will also return a pagination thing if usePagination is true.
  constructor(dataRanges, usePagination, limitMax) {
    this.dataRanges = dataRanges;
    this.usePagination = usePagination ?? false;
    this.limitMax = limitMax ?? 40;
  }

  async apiGet(requestPath, params, options) {
    const requestMin = params.sinceId ?? params.minId;
    const requestMax = params.maxId;
    const limit = params.limit ?? this.limitMax;

    var items;

    if (typeof requestMin === "undefined" && typeof requestMax !== "undefined") {
      // We're going to return the last n things ending at `requestMax`.
      var remaining = limit;
      items = this.dataRanges.filter(range => range[0] <= requestMax).toReversed().reduce((accumulator, range) => {
        for (var i=Math.min(range[1], requestMax); i >= range[0] && remaining > 0; i--) {
          accumulator.push({id: i});
          remaining -= 1;
        }
        return accumulator;
      }, []);
    } else if (typeof requestMin !== "undefined" && typeof requestMax === "undefined") {
      // We're going to return the first n things greater than or equal to `requestMax`.
      var remaining = limit;
      items = this.dataRanges.filter(range => range[1] >= requestMin).reduce((accumulator, range) => {
        for (var i=Math.max(range[0], requestMin); i <= range[1] && remaining > 0; i++) {
          accumulator.push({id: i});
          remaining -= 1;
        }
        return accumulator;
      }, []);
    } else {
      throw new Error("min or max, what is it?");
    }

    return items;

    /*
    if (options?.parsePaginationLinkHeader) {
      const paginationInfo = this.parsePaginationLinkHeader(response.headers.get('Link'));
      return {
        pagination: paginationInfo,
        body: responseJson,
      };
    } else {
      return responseJson;
    }
    */
  }
}
