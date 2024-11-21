class PopularPosts {
  db = null;

  constructor(db) {
    this.db = db;
  }

  get() {
    return this.db.get('popularPosts');
  }
}

export default PopularPosts;
