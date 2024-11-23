class PeopleDB {
  db = null;

  constructor(db) {
    this.db = db;
  }

  get(handle) {
    if (!handle) { throw new TypeError("Get which person?"); }
    return this.db.get('people', handle);
  }
}

export default PeopleDB;
