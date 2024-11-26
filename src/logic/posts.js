import { v4 as uuidv4 } from 'uuid'

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
    const totals = Object.values(this.db.get('reactions')
      .filter(reaction => reaction.reactingTo === postURI)
      .reduce((totals, reaction) => {
        const key = [reaction.type, reaction.unicode, reaction.reactName, reaction.reactServer, reaction.reactURL].join(':');

        if (typeof totals[key] === "undefined") {
          totals[key] = {...reaction};
          delete totals[key].reactorHandle;
          delete totals[key].reactingTo;
          totals[key].total = 1;
        } else {
          totals[key].total += 1;
          if (reaction.createdAt < totals[key].createdAt) {
            totals[key].createdAt = reaction.createdAt;
          }
        } 

        return totals;
      }, {}
    ));

    // There should always be Likes, even if there are 0 of them.
    if (typeof totals.find(r => r.type === "like") === "undefined") {
      totals.unshift({
        type: "like",
        unicode: null,
        reactName: null,
        reactServer: null,
        reactURL: null,
        createdAt: "", // "" will get sorted before all dates.
        total: 0,
      });
    }

    // We want to sort the oldest one at the top.
    // Except we want likes to always be at the top.
    totals.sort((a, b) => {
      if (a.type === "like") { return -1; }
      if (b.type === "like") { return 1; }
      if (a.createdAt === b.createdAt) { return 0; }
      if (a.createdAt > b.createdAt) {
        return 1;
      } else {
        return -1;
      }
    });

    return totals;
  }

  getReactionsByPerson(personHandle, postURI) {
    return this.db.get('reactions').filter(reaction => {
      const result = reaction.reactorHandle === personHandle
        && reaction.reactingTo === postURI
      ;

      return result;
    });
  }

  setReaction({reactorHandle, reactingTo, reaction, createdAt, newValue}) {
    this.db.delRow('reactions', dbReaction => {
      return (
        dbReaction.reactorHandle === reactorHandle
        && dbReaction.reactingTo === reactingTo
        && dbReaction.type === reaction.type
        && dbReaction.unicode === reaction.unicode
        && dbReaction.reactName === reaction.reactName
        && dbReaction.reactServer === reaction.reactServer
        && dbReaction.reactUrl === reaction.reactUrl
      );
    });

    // We've deleted any previous reactions of this type, by this person, on this post.
    // Now, if they wanted to add a reaction, let's put one in.
    // It'll have the latest createdAt date.
    if (newValue) {
      this.db.addRow('reactions', {
        ...reaction,
        reactorHandle,
        reactingTo,
        createdAt,
      });
    }
  }

  getBoostsOf(uri) {
    // This will return the most recent boost of this post by each person.
    // (Quote-boosts are not considered).
    return this.db.get('boosts')
      .filter(row => row.boostedPost===uri)
      .reduce((mostRecentByEachPerson, boost) => {
        const boostersPost = this.db.get('posts', boost.boostersPost);

        // If it's a quote-boost, make no changes.
        if (boostersPost.text !== null) { return mostRecentByEachPerson; }

        if (typeof mostRecentByEachPerson[boost.booster] === "undefined") {
          boost.boostersPost = boostersPost;
          boost.createdAt = boostersPost.updatedAt;
          mostRecentByEachPerson[boost.booster] = boost;
        } else {
          if (mostRecentByEachPerson[boost.booster].createdAt < boostersPost.updatedAt) {
            mostRecentByEachPerson[boost.booster].boostersPost = boost;
            mostRecentByEachPerson[boost.booster].createdAt = boostersPost.updatedAt;
          }
        }
        return mostRecentByEachPerson;
      }, {})
    ;
  }

  removeBoostsBy({boostedPostUri, boosterHandle}) {
    // Remove boosts of this post made by this person.
    // Don't touch quote-boosts.
    const boostsToRemove = this.db.get('boosts')
      .filter(boost => {
        const boostersPost = this.db.get('posts', boost.boostersPost);
        if (boost.booster === boosterHandle && boost.boostedPost === boostedPostUri && boostersPost.text === null) {
          return true;
        } else {
          return false;
        }
      })
    ;

    boostsToRemove.forEach(boostToRemove => {
      this.db.delRow('boosts', boost => 
          boost.booster === boostToRemove.booster 
          && boost.boostedPost===boostToRemove.boostedPost 
          && boost.boostersPost === boostToRemove.boostersPost
      );

      this.db.del('posts', boostToRemove.boostersPost);
    });
  }

  boost({boostedPostUri, boosterHandle}) {
    // Remove any old (non-quote) boosts.
    this.removeBoostsBy({boostedPostUri, boosterHandle});

    // Make a new boost.
    const newPostUri = boosterHandle+'/'+uuidv4();
    const createdAt = new Date().toISOString();
    const newBoostersPost = {
      uri: newPostUri,
      author: boosterHandle,
      createdAt: createdAt,
      updatedAt: createdAt,
      sensitive: false,
      text: null,
      spoilerText: null,
      deletedAt: null,
      inReplyTo: null,
      canonicalUrl: null,
      language: "en-US", // There's no text, so I don't know what to put here.  Null?
      conversationId: null,
      local: true,
    };
    this.db.set('posts', newPostUri, newBoostersPost);

    const newBoost = {
      booster: boosterHandle,
      boostersPost: newPostUri,
      boostedPost: boostedPostUri,
    };
    this.db.addRow('boosts', newBoost);
  }
}

