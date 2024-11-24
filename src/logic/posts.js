export function getPostLoader(db) {
  return ({params}) => {
    const postsDB = new PostsDB(db);

    const post = postsDB.get(params.postUri);

    return { post };
  };
}

export class PostsDB {
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

  getPostsBy(handle) {
    const posts = Object.entries(this.db.get('posts'))
      .filter(([postURI, post]) => post.author === handle)
      .map(([postURI, post]) => { return {...post, authorPerson: this.db.get('people', post.author)}; })
    ;

    posts.sort((a, b) => a.createdAt < b.createdAt);

    return posts;
  }
}
