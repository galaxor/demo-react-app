class PopularPosts {
  db = null;

  constructor(db) {
    this.db = db;
  }

  get() {
    const popularPosts = this.db.get('popularPosts');

    popularPosts.sort((a, b) => {
      if (a.updatedAt==b.updatedAt) {return 0;} else { return a.updatedAt > b.updatedAt? -1 : 1; }
    });

    return popularPosts;
  }
}

export default PopularPosts;
