import { PostsDB } from './posts.js'

class PopularPostsDB {
  db = null;

  constructor(db) {
    this.db = db;
    this.postsDB = new PostsDB(db);
  }

  getAll() {

    const allPosts = Object.values(this.db.get('posts'))
      .map(post => { return {...post, ... this.db.get('postVersions', post.uri)[post.updatedAt]}; })
      .filter(post => post.inReplyTo === null && post.text !== null && post.deletedAt === null)
    ;

    const postsForDisplay = allPosts.map(popularPost => {
      const post = this.postsDB.get(popularPost.uri);

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
