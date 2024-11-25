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

  // Return the posts that are boosted in this post.
  getBoostedPosts(uri) {
    return this.db.get('boosts')
      .filter(boostRow => boostRow.boostersPost === uri)
      .map(boostedPostRow => {
        const boostedPost = this.db.get('posts', boostedPostRow.boostedPost);
        boostedPost.authorPerson = this.db.get('people', boostedPost.author);
        return boostedPost;
      })
    ;
  }

  get(uri) {
    const post = this.db.get('posts', uri);
    post.authorPerson = this.db.get('people', post.author);
    post.boostedPosts = this.getBoostedPosts(uri);

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

  getPostsBy(handle, {showReplies, includeBoosts}) {
    const posts = Object.entries(this.db.get('posts'))
      .filter(([postURI, post]) => (post.author === handle) && (showReplies || post.inReplyTo === null) )
      .map(([postURI, post]) => { 
        const newPost = {
          ...post,
          authorPerson: this.db.get('people', post.author),
          boostedPosts: this.db.get('boosts').filter(boost => boost.booster === handle && boost.boostersPost === post.uri)
        }; 

        return newPost;
      })

      // Now take out boost posts if that's what we want.
      // We exclude posts that have no text, but boost stuff.
      // (What do we do with posts that have no text, but don't boost stuff?
      // Show it, I guess....)
      .filter(post => includeBoosts || (post.text !== null || post.boostedPosts.length === 0)) 

      // Right now, "boostedPosts" is just the rows from the boosts table.
      // Let's get the actual text of those posts.
      .map(post => { 
        return {
          ...post,
          boostedPosts: post.boostedPosts.map(boostedPostRow => {
            const boostedPost = this.db.get('posts', boostedPostRow.boostedPost);
            boostedPost.authorPerson = this.db.get('people', boostedPost.author);
            return boostedPost;
          })
        };
      })
    ;

    posts.sort((a, b) => a.updatedAt < b.updatedAt);

    return posts;
  }

  getReactionsTo(postURI) {
    const totals = Object.values(this.db.get('reactions').filter(reaction => reaction.reactingTo === postURI)
      .reduce((totals, reaction) => {
        const key = [reaction.type, reaction.unicode, reaction.reactName, reaction.reactServer].join(':');

        if (typeof totals[key] === "undefined") {
          totals[key] = {...reaction};
          delete totals[key].reactorHandle;
          delete totals[key].reactingTo;
          totals[key].total = 1;
        } else {
          totals[key] += 1;
          if (reaction.createdAt < totals[key].createdAt) {
            totals[key].createdAt = reaction.createdAt;
          }
        } 

        return totals;
      }, {}
    ));

    // We want to sort the oldest one at the top.
    totals.sort((a, b) => a.createdAt===b.createdAt? 0 : a.createdAt < b.createdAt);

    return totals;
  }
}
