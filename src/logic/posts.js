class PostsDB {
  db = null;

  constructor(db) {
    this.db = db;
  }

  get(uri) {
    return this.db.get('posts', uri);
  }
}

export default PostsDB;
