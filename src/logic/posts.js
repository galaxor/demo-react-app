class PostsDB {
  db = null;

  constructor(db) {
    this.db = db;
  }

  get(uri) {
    const post = this.db.get('posts', uri);
    post.authorPerson = this.db.get('people', post.author);
    return post;
  }
}

export default PostsDB;
