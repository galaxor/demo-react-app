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

  getRepliesTo(uri) {
    const replies = Object.entries(this.db.get('posts'))
      .filter(([postURI, post]) => post.inReplyTo === uri)
      .map(([postURI, post]) => { return {...post, authorPerson: this.db.get('people', post.author)}; })
    ;

    replies.sort((a, b) => a.createdAt < b.createdAt);

    return replies;
  }
}

export default PostsDB;
