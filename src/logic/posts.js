import sha256 from '../include/sha256.js'

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
        const boostedPost = this.get(boostedPostRow.boostedPost);
        return {...boostedPost};
      })
    ;
  }

  async getFeaturedPosts() {
    const transaction = this.db.db.transaction(["posts", "postVersions", "imageVersions", "people", "boosts"]);
    const postsStore = transaction.objectStore("posts");
    const postVersionsStore = transaction.objectStore("postVersions");
    const imageVersionsStore = transaction.objectStore("imageVersions");
    const peopleStore = transaction.objectStore("people");
    const boostsStore = transaction.objectStore("boosts");

    return new Promise(resolve => {
      const featuredPosts = [];
      postsStore.openCursor().onsuccess = async event => {
        const cursor = event.target.result;

        if (cursor === null) {
          featuredPosts.sort((a, b) => a.updatedAt === b.updatedAt? 0 : (a.updatedAt < b.updatedAt? 1 : -1));
          resolve(featuredPosts);
        } else {
          const post = cursor.value;
          if (post.inReplyTo === null && post.deletedAt === null) {
            const fullPost = await this.getFullPostFromObjectStores(post, {postVersionsStore, imageVersionsStore, peopleStore});
            if (fullPost.text !== null) {
              featuredPosts.push(fullPost);
            }
          }
          cursor.continue();
        }
      };
    });
  }

  async getBoostedPostsFromObjectStore(uri, {boostsStore, peopleStore, postVersionsStore, imageVersionsStore}) {
    return await new Promise(resolve => {
      const boostedPosts = [];
      boostsStore.index("boostersPost").openCursor(uri).onsuccess = async event => {
        const boostedPostsCursor = event.target.result;

        if (boostedPostsCursor === null) {
          // We've gotten them all.  Return the list.
          resolve(boostedPosts);
        } else {
          // We don't need to see the posts that the boosted posts was
          // boosting, or we could recurse forever in a long chain of boosts!
          // So, don't pass boostsStore in.
          const boostedPost = boostedPostsCursor.value;
          
          const fullBoostedPost = await getFullPostFromObjectStores(boostedPost, {postVersionsStore, imageVersionsStore, peopleStore});
          boostedPosts.push(fullBoostedPost);

          boostedPostsCursor.continue();
        }
      };
    });
  }

  async get(uri) {
    const transaction = this.db.db.transaction(["posts", "postVersions", "imageVersions", "people", "boosts"]);
    const postsStore = transaction.objectStore("posts");
    const postVersionsStore = transaction.objectStore("postVersions");
    const imageVersionsStore = transaction.objectStore("imageVersions");
    const peopleStore = transaction.objectStore("people");
    const boostsStore = transaction.objectStore("boosts");

    const post = await this.db.getFromObjectStore(postsStore, uri);

    if (typeof post !== "undefined" && post.deletedAt === null) {
      return await this.getFullPostFromObjectStores(post, {postVersionsStore, imageVersionsStore, boostsStore, peopleStore});
    } else {
      return this.db.nullPost();
    }
  }

  getVersions(uri) {
    const post = this.db.get('posts', uri);

    if (post.deletedAt === null) {
      post.authorPerson = this.db.get('people', post.author);
      post.boostedPosts = this.getBoostedPosts(uri);
      const versions = this.db.get('postVersions', uri);

      const postWithVersions = {};
      for (const updatedAt in versions) {
        postWithVersions[updatedAt] = {...post, ...versions[updatedAt], updatedAt};
      }

      return postWithVersions;
    } else {
      return this.db.nullPost();
    }
  }

  deletePost(uri) {
    const post = this.db.get('posts', uri);
    post.deletedAt = new Date();
    this.db.set('posts', uri, post);
  }

  async getNumRepliesTo(uri) {
    const transaction = this.db.db.transaction("posts");
    const postsStore = transaction.objectStore("posts");
    return new Promise(resolve => {
      postsStore.index("inReplyTo").count(uri).onsuccess = event => {
        resolve(event.target.result);
      };
    });
  }

  getRepliesTo(uri) {
    if (uri === null) {
      return [];
    }

    const replies = Object.values(this.db.get('posts'))
      .filter(post => post.inReplyTo === uri)
      .map(post => {
        if (post.deletedAt === null) {
          const version = this.db.get('postVersions', post.uri)[post.updatedAt];
          return {...post, ...version, authorPerson: this.db.get('people', post.author)}; 
        } else {
          return { ...this.db.nullPost(), uri: post.uri, inReplyTo: uri };
        }
      })
    ;

    replies.sort((a, b) => a.createdAt===b.createdAt? 0 : (a.createdAt > b.createdAt? 1 : 0));

    return replies;
  }

  getPostsBy(handle, {showReplies, includeBoosts}) {
    const posts = Object.entries(this.db.get('posts'))
      .filter(([postURI, post]) => (post.author === handle) && (showReplies || post.inReplyTo === null) )
      .map(([postURI, post]) => { 
        const version = this.db.get('postVersions', post.uri)[post.updatedAt];
        const newPost = {
          ...post,
          ...version,
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
            const boostedPost = this.get(boostedPostRow.boostedPost);
            return boostedPost;
          })
        };
      })
    ;

    posts.sort((a, b) => a.updatedAt===b.updatedAt? 0 : (a.updatedAt < b.updatedAt? 1 : 0));

    return posts;
  }

  async getReactionsTo(postURI, options) {
    const by = (typeof options === "undefined")? undefined : options.by;

    const transaction = this.db.db.transaction("reactions");
    const reactionsStore = transaction.objectStore("reactions");
    return await new Promise(resolve => {
      const totals = {};

      const cursorRequest = (typeof by === "undefined")?
        reactionsStore.index("reactingTo").openCursor(postURI)
        : reactionsStore
          .index("reactorHandle,reactingTo")
          .openCursor([by, postURI])
      ;

      cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result;

        if (cursor === null) {
          const finalTotals = Object.values(totals);

          // There should always be Likes, even if there are 0 of them.
          if (typeof finalTotals.find(r => r.type === "like") === "undefined") {
            finalTotals.unshift({
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
          finalTotals.sort((a, b) => {
            if (a.type === "like") { return -1; }
            if (b.type === "like") { return 1; }
            if (a.createdAt === b.createdAt) { return 0; }
            if (a.createdAt > b.createdAt) {
              return 1;
            } else {
              return -1;
            }
          });

          resolve(finalTotals);
        } else {
          const reaction = cursor.value;
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

          cursor.continue();
        }
      }
    });
  }

  async getReactionsByPerson(personHandle, postURI) {
    return await this.getReactionsTo(postURI, {by: personHandle});
  }

  getAllReactionsTo(postURI) {
    const totals = Object.values(this.db.get('reactions')
      .filter(reaction => reaction.reactingTo === postURI)
      .reduce((reactionsList, reaction) => {
        const key = [reaction.type, reaction.unicode, reaction.reactName, reaction.reactServer, reaction.reactURL].join(':');

        if (typeof reactionsList[key] === "undefined") {
          reactionsList[key] = {...reaction, reactors: [this.db.get('people', reaction.reactorHandle)]};
        } else {
          reactionsList[key].reactors.push(this.db.get('people', reaction.reactorHandle));
          if (reaction.createdAt < reactionsList[key].createdAt) {
            reactionsList[key].createdAt = reaction.createdAt;
          }
        } 

        // At this point, the list is:
        // {<key>: {type, unicode, reactName, reactServer, reactURL, altText, createdAt, reactors: [<person-object>, ...]}}
        return reactionsList;
      }, {}
    ));

    // At this point, the list is:
    // [{type, unicode, reactName, reactServer, reactURL, altText, createdAt, reactors: [<person-object>, ...]}]

    // For the detail view, we don't need to ensure that Likes are represented if there are 0 of them.

    // We want to sort the oldest one at the top.
    // That is, we want it in the order of "when was the first time a person used this react".
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
        const boostersPost = this.get(boost.boostersPost);

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

  async getNumberOfBoostsOf(uri, options) {
    const by = (typeof options === "undefined")? undefined : options.by;
    const quote = (typeof options === "undefined")? false : options.quote;

    const transaction = this.db.db.transaction(["boosts", "posts", "postVersions"]);
    const boostsStore = transaction.objectStore("boosts");
    const postsStore = transaction.objectStore("posts");
    const postVersionsStore = transaction.objectStore("postVersions");
    return await new Promise(async resolve => {
      // We will make a structure that's like {[boosterHandle]: true, ...}.
      // In other words, we will have one key for each person who has at least
      // one boost in the database, and the irrelevant value will always be
      // true.  We can find out how many boosts of a post there were by
      // counting the keys of boostedByPeople.
      // (Quote-boosts are not considered, unless the quote option is set, in
      // which case only quote boosts are considered).
      const boostedByPeople = {};

      // Are we trying to find out if a certain person boosted the post?  
      // If not, we will not have "by" set, and we will open a cursor on 
      // just boostedPost.
      // If so, we will have "by" set, and we will open a cursor 
      // on [booster, boostedPost].
      const cursor = (typeof by === "undefined")?
        boostsStore.index("boostedPost").openCursor(uri)
        : boostsStore.index("booster,boostedPost").openCursor([by, uri])
      ;

      cursor.onsuccess = async event => {
        const boostsCursor = event.target.result;
        if (boostsCursor === null) {
          resolve(Object.keys(boostedByPeople).length);
        } else {
          const boostRow = boostsCursor.value;
          const post = await this.db.getFromObjectStore(postsStore, boostRow.boostersPost);
          const postVersion = await this.db.getFromObjectStore(postVersionsStore, [post.uri, post.updatedAt]);

          // If the "quote" option is set, only count this if the text is not null.
          // If the "quote" option is not set, only count this if the text is null.
          if ((postVersion.text === null) === !quote) {
            boostedByPeople[boostRow.booster] = true;
          }
          boostsCursor.continue();
        }
      };
    });
  }

  async getNumberOfQuoteBoostsOf(uri, options) {
    const by = options? options.by : undefined;
    return await this.getNumberOfBoostsOf(uri, {by, quote: true});
  }

  removeBoostsBy({boostedPostUri, boosterHandle}) {
    // Remove boosts of this post made by this person.
    // Don't touch quote-boosts.
    const boostsToRemove = this.db.get('boosts')
      .filter(boost => {
        const boostersPost = this.get( boost.boostersPost);
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
    const newPostUri = boosterHandle+'/'+crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const newBoostersPost = {
      uri: newPostUri,
      author: boosterHandle,
      createdAt: createdAt,
      updatedAt: createdAt,
      deletedAt: null,
      inReplyTo: null,
      canonicalUrl: null,
      conversationId: null,
      local: true,
    };
    this.db.set('posts', newPostUri, newBoostersPost);

    const newBoostersPostVersion = {
      [createdAt]: {
        uri: newPostUri,
        updatedAt: createdAt,
        sensitive: false,
        spoilerText: null,
        language: null, // There's no text, so I don't know what to put here.  Null?
        type: "text",
        text: null,
      },
    };
    this.db.set('postVersions', newPostUri, newBoostersPostVersion);

    const newBoost = {
      booster: boosterHandle,
      boostersPost: newPostUri,
      boostedPost: boostedPostUri,
    };
    this.db.addRow('boosts', newBoost);
  }

  quoteBoost({boostersPostUri, boostedPostUri, boosterHandle}) {
    const newBoost = {
      booster: boosterHandle,
      boostersPost: boostersPostUri,
      boostedPost: boostedPostUri,
    };

    this.db.addRow('boosts', newBoost);
  }

  getQuoteBoostsOf(uri) {
    return this.db.boosts.filter(boost => boost.boostedPost === uri)
      .map(boost => { return {...boost, boostersPost: this.get(boost.boostersPost)}; })
      
      // Get rid of the boosts that are not quote-boosts.
      .filter(boost => boost.boostersPost.text !== null)
    ;
  }

  addPost(post) {
    const postVersion = {
      [post.updatedAt]: {
        uri: post.uri,
        updatedAt: post.updatedAt,
        sensitive: post.sensitive,
        spoilerText: post.spoilerText,
        language: post.language,
        type: post.type,
        text: post.text,
      },
    };

    const newPost = {... post};
    delete newPost.sensitive;
    delete newPost.spoilerText;
    delete newPost.language;
    delete newPost.type;
    delete newPost.text;

    this.db.set('posts', post.uri, newPost);
    const oldVersions = this.db.get('postVersions', post.uri);
    this.db.set('postVersions', post.uri, {...oldVersions, ...postVersion});
    return this.get(post.uri);
  }

  updatePost(post) {
    // It looks like we can just use addPost, in the current database implementation.
    this.addPost(post);
    return this.get(post.uri);
  }

  async friendsFeed(user) {
    const transaction = this.db.db.transaction(["follows", "posts", "postVersions", "imageVersions", "people", "boosts"]);
    const followsStore = transaction.objectStore("follows");
    const postsStore = transaction.objectStore("posts");
    const postVersionsStore = transaction.objectStore("postVersions");
    const imageVersionsStore = transaction.objectStore("imageVersions");
    const peopleStore = transaction.objectStore("people");
    const boostsStore = transaction.objectStore("boosts");

    const theirPosts = [];

    return await new Promise(async resolve => {
      const followCursorRequest = followsStore.index("follower").openCursor(user.handle);
      followCursorRequest.onsuccess = async (event) => {
        const followCursor = event.target.result;

        if (followCursor === null) {
          // We've gotten all of your followers and we're now done.
          // Perhaps this success function has filled theirPosts or perhaps it
          // hasn't and the array stands empty.
          // In any case, we'll return what we've got.
          // (but we sort it by updatedAt first).
          theirPosts.sort((a, b) => a.updatedAt === b.updatedAt? 0 : (a.updatedAt < b.updatedAt? 1 : -1));
          resolve(theirPosts);
        } else {
          // XXX What we would ideally do is, for each of your followees, we
          // would open a cursor of their posts, sorted by updatedAt.  We would
          // pick the next post from each of these cursors, pick the one with the
          // highest updatedAt, put the post in the output list, advance that
          // cursor, and then  iterate again, picking the one with the highest
          // updatedAt, no matter who it comes from, and updating their cursor.
          // Do this until we've filled the output list.  To do pagination right,
          // we would store in React state variable what we felt was the highest
          // updatedAt for each followee, at the time of the query.  That way,
          // you can paginate stably, without new posts coming in to mess it up.
          // I can probably create an index on ["author", "updatedDate"] maybe??
          //
          // For now, though, I'll just grab all the posts by all your followers
          // and then sort them in one huge array.
          const followeeHandle = followCursor.value.followed;

          const followeePerson = await this.db.getFromObjectStore(peopleStore, followeeHandle);
          const postsCursorRequest = postsStore.index("author").openCursor(followeeHandle);
          postsCursorRequest.onsuccess = async event => {
            const postsCursor = event.target.result;

            if (postsCursor === null) {
              // We've gotten all the posts we can from this follwee.
              // Move to the next followee.
              followCursor.continue();
            } else {
              const post = postsCursor.value;
              post.authorPerson = followeePerson;

              const fullPost = await this.getFullPostFromObjectStores(post, {postVersionsStore, imageVersionsStore, boostsStore, peopleStore});

              theirPosts.push(fullPost);
              postsCursor.continue();
            }
          };
        }
      };
    });
  }

  async getFullPostFromObjectStores(post, {postVersionsStore, imageVersionsStore, boostsStore, peopleStore}) {
    // Maybe they don't want the boosted posts and so they didn't pass us the
    // boosts object store.
    if (typeof boostsStore !== "undefined") {
      post.boostedPosts = await this.getBoostedPostsFromObjectStore(post.uri, {boostsStore, peopleStore, postVersionsStore, imageVersionsStore});
    }

    // Maybe they already have the authorPerson filled out.  
    // If so, don't fetch it again.
    // In the boosts, we looked to see if we'd been passed a boostsStore, to
    // decide whether to fill out the boosts.
    // We can't do the same thing here, because what if you already filled out
    // the post's author, but you want to get the boosts?  We're going to want
    // to know the authors for those boosts!
    if (typeof post.authorPerson === "undefined") {
      post.authorPerson = await this.db.getFromObjectStore(peopleStore, post.author);
    }

    // Get postVersion and imageVersion.
    const postVersion = await this.db.getFromObjectStore(postVersionsStore, [post.uri, post.updatedAt]);
    const imageVersion = await this.db.getFromObjectStore(imageVersionsStore, [post.uri, post.updatedAt]);

    return {...post, ...postVersion, ...imageVersion};
  }

  async attachImages(postUri, images, updatedAt) {
    for (const fileName in images) {
      const image = images[fileName];
      const imageHash = await sha256(image.data);
      this.db.set('images', imageHash, {data: image.data});
      delete images[fileName].data;
      images[fileName].image = imageHash;
    }

    const dbImages = this.db.get('imageVersions', postUri) ?? {};
    dbImages[updatedAt] = images;
    this.db.set('imageVersions', postUri, dbImages);
  }

  getImagesForPost(postUri, versionUpdatedAt) {
    const {latestUpdatedAt, deletedAt} = this.db.get('posts', postUri);
    if (deletedAt !== null) {
      return {};
    }

    const updatedAt = versionUpdatedAt ?? latestUpdatedAt;

    const imageVersions = this.db.get('imageVersions', postUri);
    if (typeof imageVersions === "undefined") {
      return {};
    }
    const imageVersion = imageVersions[updatedAt];
    for (const fileName in imageVersion) {
      imageVersion[fileName].data = this.db.get('images', imageVersion.image)[imageVersion[fileName].image].data;
    }
    
    return imageVersion;
  }
}

