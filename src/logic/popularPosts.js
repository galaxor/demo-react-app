class PopularPostsDB {
  db = null;

  constructor(db) {
    this.db = db;
  }

  getAll() {
    const allPosts = Object.values(this.db.get('posts'))
      .filter(post => post.inReplyTo === null && post.text !== null)
    ;

    const postsForDisplay = allPosts.map(popularPost => {
      var post = this.db.get('posts', popularPost.uri);
      post.authorPerson = this.db.get('people', post.author);

      return post;
    });

    postsForDisplay.sort((a, b) => a.updatedAt === b.updatedAt? 0 : (a.updatedAt < b.updatedAt? 1 : -1));

    return postsForDisplay;
  }

  get() {
    const popularPosts = this.db.get('popularPosts');
  
    const postsForDisplay = popularPosts.map(popularPost => {
      var post = this.db.get('posts', popularPost.uri);
      post.authorPerson = this.db.get('people', post.author);

      return post;
    });

    postsForDisplay.sort((a, b) => {
      if (a.updatedAt==b.updatedAt) {return 0;} else { return a.updatedAt > b.updatedAt? -1 : 1; }
    });

    return postsForDisplay;
  }
}

export default PopularPostsDB;
