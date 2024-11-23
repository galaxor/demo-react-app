export class PeopleDB {
  db = null;

  constructor(db) {
    this.db = db;
  }

  get(handle) {
    if (!handle) { throw new TypeError("Get which person?"); }
    return this.db.get('people', handle);
  }

  whoFollowsThem(handle) {
    if (!handle) { throw new TypeError("We're asking who follows someone, but we don't know who someone is."); }

    const followsPerson = this.db.get('follows')
      .filter(([personWhoFollows, personWhoIsFollowed]) => {
        return personWhoIsFollowed === handle;
      })
      .map(([handleOfPersonWhoFollows, handleOfPersonWhoIsFollowed]) => {
        const personWhoFollows = this.get(handleOfPersonWhoFollows);
        return personWhoFollows;
      })
    ;

    return followsPerson;
  }

  doesXFollowY(xHandle, yHandle) {
    return this.db.get('follows').filter(([x, y]) => x === xHandle && y === yHandle).length > 0;
  }

  follow(personWhoFollows, personWhoIsFollowed) {
    if (this.doesXFollowY(personWhoFollows, personWhoIsFollowed)) {
      // It's a no-op. It has already been done.
      return;
    } else {
      this.db.addRow('follows', [personWhoFollows, personWhoIsFollowed]);
    }
  }

  unfollow(personWhoOnceFollowed, personWhoWasOnceFollowed) {
    this.db.delRow('follows', (([a, b]) => {
      const result = (personWhoOnceFollowed === a && personWhoWasOnceFollowed === b);
      return result;
    }));
  }
}

export function getPersonLoader(db) {
  return ({params}) => {
    const peopleDB = new PeopleDB(db);

    const person = peopleDB.get(params.handle);

    return { person };
  };
}
