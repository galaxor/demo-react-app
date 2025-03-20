import sha256 from '../include/sha256.js'

export function getPostLoader(db) {
  return async ({params}) => {
    const serverUrl = localStorage.getItem('serverUrl');
    await db.open(serverUrl);

    const postsDB = new PostsDB(db);

    const post = await postsDB.get(params.postUri);

    return { post };
  };
}

export class PostsDB {
  db = null;

  constructor(db) {
    this.db = db;
  }

  // Return the posts that are boosted in this post.
  async getBoostedPosts(uri) {
    const transaction = this.db.db.transaction(["posts", "postVersions", "imageVersions", "people", "boosts"]);
    const postsStore = transaction.objectStore("posts");
    const postVersionsStore = transaction.objectStore("postVersions");
    const imageVersionsStore = transaction.objectStore("imageVersions");
    const peopleStore = transaction.objectStore("people");
    const boostsStore = transaction.objectStore("boosts");
    
    return await this.getBoostedPostsFromObjectStore(uri, {boostsStore, peopleStore, postsStore, postVersionsStore, imageVersionsStore});
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
            const fullPost = await this.getFullPostFromObjectStores(post, {postsStore, postVersionsStore, imageVersionsStore, peopleStore, boostsStore});
            if (fullPost.text !== null) {
              featuredPosts.push(fullPost);
            }
          }
          cursor.continue();
        }
      };
    });
  }

  async getBoostedPostsFromObjectStore(uri, {boostsStore, peopleStore, postsStore, postVersionsStore, imageVersionsStore}) {
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
          const boostRow = boostedPostsCursor.value;

          postsStore.get(boostRow.boostedPost).onsuccess = async event => {
            const boostedPost = event.target.result;
            if (boostedPost !== null) {
              const fullBoostedPost = await this.getFullPostFromObjectStores(boostedPost, {postVersionsStore, imageVersionsStore, peopleStore});
              boostedPosts.push(fullBoostedPost);
            }
          }

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
      return await this.getFullPostFromObjectStores(post, {postsStore, postVersionsStore, imageVersionsStore, boostsStore, peopleStore});
    } else {
      return {...this.db.nullPost(), ...this.db.nullVersion()};
    }
  }

  getVersions(uri) {
    const transaction = this.db.db.transaction(["people", "posts", "postVersions", "imageVersions"]);
    const peopleStore = transaction.objectStore("people");
    const postsStore = transaction.objectStore("posts");
    const postVersionsStore = transaction.objectStore("postVersions");
    const imageVersionsStore = transaction.objectStore("imageVersions");

    return new Promise(resolve => {
      postsStore.get(uri).onsuccess = event => {
        const post = event.target.result;

        if (post.deletedAt !== null) {
          resolve({});
        }

        const promises = [];
        promises.push(new Promise(resolve => {
          peopleStore.get(post.author).onsuccess = event => {
            const person = event.target.result;
            post.authorPerson = person;
            resolve();
          };
        }));
  

        const versions = {};
        postVersionsStore.index("uri").openCursor(uri).onsuccess = event => {
          const cursor = event.target.result;
          if (cursor === null) {
            Promise.all(promises).then(() => {
              resolve(versions);
            });
          } else {
            const postVersion = cursor.value;
            promises.push(new Promise(resolve2 => {
              try {
                imageVersionsStore.get([uri, postVersion.updatedAt]).onsuccess = event => {
                  const imageVersion = event.target.result;
                  postVersion.images = imageVersion.files;
                  versions[postVersion.updatedAt] = {...post, ...postVersion};
                  resolve2();
                };
              } catch (e) {
                if (error instanceof DOMException && error.name === "DataError") {
                  // There wasn't an imageVersion to go with this postVersion.  No big deal.
                  postVersion.images = {};
                  versions[postVersion.updatedAt] = {...post, ...postVersion};
                  resolve2();
                }
              }
            }));
            cursor.continue();
          }
        };
      };
    });
  }

  async deletePost(uri) {
    const post = await this.db.get('posts', uri);
    post.deletedAt = new Date().toISOString();
    await this.db.set('posts', post);
  }

  async getNumRepliesTo(uri) {
    const transaction = this.db.db.transaction("posts");
    const postsStore = transaction.objectStore("posts");
    return new Promise(resolve => {
      var numReplies = 0;

      postsStore.index("inReplyTo").openCursor(uri).onsuccess = event => {
        const cursor = event.target.result;
        if (cursor === null) {
          resolve(numReplies);
        } else {
          if (cursor.value.deletedAt === null) {
            numReplies += 1;
          }
          cursor.continue();
        }
      };
    });
  }

  async getRepliesTo(uri) {
    if (uri === null) {
      return [];
    }

    const transaction = this.db.db.transaction(["posts", "postVersions", "people", "boosts", "imageVersions"]);
    const postsStore = transaction.objectStore("posts");
    const postVersionsStore = transaction.objectStore("postVersions");
    const imageVersionsStore = transaction.objectStore("imageVersions");
    const boostsStore = transaction.objectStore("boosts");
    const peopleStore = transaction.objectStore("people");

    return new Promise(resolve => {
      const replies = [];
      postsStore.index("inReplyTo").openCursor(uri).onsuccess = async event => {
        const cursor = event.target.result;
        if (cursor === null) {
          replies.sort((a, b) => a.createdAt===b.createdAt? 0 : (a.createdAt > b.createdAt? 1 : 0));
          resolve(replies);
        } else {
          const post = cursor.value;
          if (post.deletedAt === null) {
            replies.push(await this.getFullPostFromObjectStores(post, {postsStore, postVersionsStore, imageVersionsStore, boostsStore, peopleStore}));
          } else {
            replies.push({ ...this.db.nullPost(), ...this.db.nullVersion(), uri: post.uri, inReplyTo: uri });
          }

          cursor.continue();
        }
      }
    });
  }

  /**
   * Given an initial post, load all the replies of the entire thread starting at that post.
   */
  async getRepliesRecursive(postRepliedTo) {
    return new Promise(async resolve => {
      if (postRepliedTo === null) {
        resolve();
      } else {
        const replies = await this.getRepliesTo(postRepliedTo.uri);
        for(const replyPost of replies) {
          await this.getRepliesRecursive(replyPost);
        }

        postRepliedTo.replies = replies.filter(replyPost => replyPost.deletedAt === null || replyPost.replies.length > 0);
        resolve();
      }
    });
  }

  async getPostsBy(handle, {showReplies, includeBoosts}) {
    const transaction = this.db.db.transaction(["posts", "postVersions", "imageVersions", "people", "boosts"]);
    const postsStore = transaction.objectStore("posts");
    const postVersionsStore = transaction.objectStore("postVersions");
    const imageVersionsStore = transaction.objectStore("imageVersions");
    const peopleStore = transaction.objectStore("people");
    const boostsStore = transaction.objectStore("boosts");

    return new Promise(resolve => {
      const posts = [];
      postsStore.index("author").openCursor(handle).onsuccess = async event => {
        const cursor = event.target.result;
        if (cursor === null) {
          posts.sort((a, b) => a.updatedAt===b.updatedAt? 0 : (a.updatedAt < b.updatedAt? 1 : 0));
          resolve(posts);
        } else {
          const post = cursor.value;
          if (post.deletedAt === null && (showReplies || post.inReplyTo === null)) {
            const fullPost = await this.getFullPostFromObjectStores(post, {postsStore, postVersionsStore, imageVersionsStore, boostsStore, peopleStore});
            if (includeBoosts || (fullPost.text !== null || fullPost.boostedPosts.length === 0)) {
              posts.push(fullPost);
            }
          }
          cursor.continue();
        }
      }
    });
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

  async getAllReactionsTo(postURI) {
    const transaction = this.db.db.transaction(["reactions", "people"]);
    const reactionsStore = transaction.objectStore("reactions");
    const peopleStore = transaction.objectStore("people");

    return new Promise(resolve => {
      const totals = {};
      const people = {};
      reactionsStore.index("reactingTo").openCursor(postURI).onsuccess = async event => {
        const cursor = event.target.result;
        if (cursor === null) {
          const reactionsList = Object.values(totals);
          // At this point, the list is:
          // [{type, unicode, reactName, reactServer, reactURL, altText, createdAt, reactors: [<person-object>, ...]}]

          // For the detail view, we don't need to ensure that Likes are represented if there are 0 of them.

          // We want to sort the oldest one at the top.
          // That is, we want it in the order of "when was the first time a person used this react".
          // Except we want likes to always be at the top.
          reactionsList.sort((a, b) => {
            if (a.type === "like") { return -1; }
            if (b.type === "like") { return 1; }
            if (a.createdAt === b.createdAt) { return 0; }
            if (a.createdAt > b.createdAt) {
              return 1;
            } else {
              return -1;
            }
          });

          resolve(reactionsList);
        } else {
          const reaction = cursor.value;
          const key = `${reaction.type}:${reaction.unicode}:${reaction.reactName}:${reaction.reactServer}:${reaction.reactURL}`;
          const reactorHandle = reaction.reactorHandle;
          if (typeof totals[key] === "undefined") {
            totals[key] = {...reaction};
            delete totals[key].reactorHandle;
            totals[key].reactors = [];
          } else if (reaction.createdAt < totals[key].createdAt) {
            totals[key].createdAt = reaction.createdAt;
          }

          // We're caching the people who reacted, so that if someone gave
          // multiple reactions, we don't have to go to the database for each
          // one to get their person object.
          if (typeof people[reactorHandle] === "undefined") {
            people[reactorHandle] = await this.db.getFromObjectStore(peopleStore, reactorHandle);
          }
          totals[key].reactors.push(people[reactorHandle]);

          cursor.continue();
        }
      };
    });
  }

  async setReaction({reactorHandle, reactingTo, reaction, createdAt, newValue}) {
    const transaction = this.db.db.transaction("reactions", "readwrite");
    const reactionsStore = transaction.objectStore("reactions");
    return new Promise(resolve => {
      const promisesOfDeletion = [];
      reactionsStore.index("reactorHandle,reactingTo").openCursor([reactorHandle, reactingTo]).onsuccess = event => {
        const cursor = event.target.result;
        if (cursor === null) {
          Promise.all(promisesOfDeletion).then(() => {
            // We've deleted any previous reactions of this type, by this person, on this post.
            // Now, if they wanted to add a reaction, let's put one in.
            // It'll have the latest createdAt date.
            if (newValue) {
              reactionsStore.add({
                ...reaction,
                reactorHandle,
                reactingTo,
                createdAt,
              }).onsuccess = event => {
                resolve(undefined);
              };
            } else {
              resolve(undefined);
            }
          });
        } else {
          const dbReaction = cursor.value;
          if (dbReaction.type === reaction.type
              && dbReaction.unicode === reaction.unicode
              && dbReaction.reactName === reaction.reactName
              && dbReaction.reactServer === reaction.reactServer
              && dbReaction.reactUrl === reaction.reactUrl
          ) {
            promisesOfDeletion.push(new Promise(resolve2 => {
              const key = cursor.primaryKey;
              try {
                reactionsStore.delete(key).onsuccess = event => {
                  resolve2(event.target.result);
                };
              } catch (error) {
                if (error instanceof DOMException && error.name === "DataError") {
                  // The data didn't exist. No big deal.
                  resolve2(undefined);
                } else {
                  throw error;
                }
              }
            }));
          }
          cursor.continue();
        }
      };
    });
  }

  async getBoostsOf(uri, options) {
    const by = (typeof options === "undefined")? undefined : options.by;
    const quote = (typeof options === "undefined")? false : options.quote;
    const getPeople = (typeof options === "undefined")? false : options.getPeople;

    const transaction = this.db.db.transaction(["boosts", "people", "posts", "postVersions"]);
    const boostsStore = transaction.objectStore("boosts");
    const peopleStore = transaction.objectStore("people");
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

      // If we're doing quote boosts, we want to return each individual boost
      // post as a post.
      const quoteBoosts = [];

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
          // We've been through all the boosts and we're ready to return our results.
          // We've been building up the results in one of two objects:
          // * If we've been collecting quote-boosts, then `quoteBoosts` is a
          //   list of post objects, with the versions filled in, and not the
          //   author or the images.
          //   We will want to fill in the authors.
          // * If we haven't been collecting quote boosts, then
          //   `boostedByPeople` is an object {[handle]: updatedAt}, where
          //   "updatedAt" is the earliest known boost by that person.
          //   We will want to return a list of {authorPerson: (person object), updatedAt: (date string)}'s.

          if (quote) {
            const promises = quoteBoosts.map(quoteBoost => this.db.getFromObjectStore(peopleStore, quoteBoost.author).then(authorPerson => quoteBoost.authorPerson = authorPerson));
            await Promise.all(promises);
            resolve(quoteBoosts);
          } else {
            if (getPeople) {
              const peoplePromises = Object.keys(boostedByPeople).map(handle => this.db.getFromObjectStore(peopleStore, handle));
              const peopleObjects = await Promise.all(peoplePromises);

              const boostPosts = peopleObjects.map(person => {return {authorPerson: person, updatedAt: boostedByPeople[person.handle]}; });
              boostPosts.sort((a, b) => a.updatedAt === b.updatedAt? 0 : a.updatedAt < b.updatedAt? -1 : 1);
              resolve(boostPosts);
            } else {
              resolve(Object.entries(boostedByPeople).map(([author, updatedAt]) => {
                return {author, updatedAt};
              }));
            }
          }
        } else {
          const boostRow = boostsCursor.value;
          const post = await this.db.getFromObjectStore(postsStore, boostRow.boostersPost);

          // Don't count deleted posts.
          if (post.deletedAt === null) {
            const postVersion = await this.db.getFromObjectStore(postVersionsStore, [post.uri, post.updatedAt]);

            // If the "quote" option is set, only count this if the text is not null.
            // If the "quote" option is not set, only count this if the text is null.
            if (quote && postVersion.text !== null) {
              quoteBoosts.push({...post, ...postVersion});
            } else if (!quote && postVersion.text === null) {
              const existingUpdatedAt = boostedByPeople[boostRow.booster] ?? '9999';
              boostedByPeople[boostRow.booster] = existingUpdatedAt < post.updatedAt? existingUpdatedAt : post.updatedAt;
            }
          }
          boostsCursor.continue();
        }
      };
    });
  }

  getQuoteBoostsOf(uri, options) {
    return this.getBoostsOf(uri, {...options, quote: true});
  }

  async getNumberOfBoostsOf(uri, options) {
    return (await this.getBoostsOf(uri, options)).length;
  }

  async getNumberOfQuoteBoostsOf(uri, options) {
    const by = options? options.by : undefined;
    return await this.getNumberOfBoostsOf(uri, {by, quote: true});
  }

  // You can optionally provide the boostsStoreArg, postsStoreArg, and
  // postVersionsStoreArg if you already have a transaction open.
  // The this.boost() function will do this to ensure that the old boosts are
  // removed and the new one is added in the same transaction.
  removeBoostsBy({boostedPostUri, boosterHandle, boostsStoreArg, postsStoreArg, postVersionsStoreArg}) {
    const transaction = (!boostsStoreArg || !postsStoreArg)?
      this.db.db.transaction(["boosts", "posts", "postVersions"], "readwrite")
      : undefined;

    const boostsStore = boostsStoreArg ?? transaction.objectStore("boosts");
    const postsStore = postsStoreArg ?? transaction.objectStore("posts");
    const postVersionsStore = postVersionsStoreArg ?? transaction.objectStore("postVersions");

    return new Promise(resolve => {
      const boostsToRemove = [];
      const promises = [];

      boostsStore.index("booster,boostedPost").openCursor([boosterHandle, boostedPostUri]).onsuccess = event => {
        const cursor = event.target.result;
        if (cursor === null) {
          // Wait for all the checks to resolve, to know we've got the
          // complete list of boosts that need to be removed.
          Promise.all(promises).then(() => {
            const promisesOfRemoval = [];

            // Remove the boosts.
            for (const [boostKey, boostersPost] of boostsToRemove) {
              promisesOfRemoval.push(new Promise(resolve2 => {
                postVersionsStore.delete([boostersPost.uri, boostersPost.updatedAt]).onsuccess = event => {
                  resolve2();
                };
              }));

              promisesOfRemoval.push(new Promise(resolve2 => {
                postsStore.delete(boostersPost.uri).onsuccess = event => {
                  resolve2();
                };
              }));

              promisesOfRemoval.push(new Promise(resolve2 => {
                boostsStore.delete(boostKey).onsuccess = event => {
                  resolve2();
                };
              }));
            }

            // We are done.
            Promise.all(promisesOfRemoval).then(() => resolve());
          });
        } else {
          // We only want to remove the boost if it's not a quote-boost.  To
          // find out if it's a quote-boost, we need to get the booster's post,
          // and its postVersion.  We'll check the text of the postVersion.  If
          // it's null, this is not a quote boost, so we want to remove it.
          const boostKey = cursor.primaryKey;
          const boostersPostUri = cursor.value.boostersPost;
          
          promises.push(new Promise(resolve2 => {
            postsStore.get(boostersPostUri).onsuccess = event => {
              const boostersPost = event.target.result;
              const updatedAt = boostersPost.updatedAt;
              postVersionsStore.get([boostersPost.uri, updatedAt]).onsuccess = event => {
                const postVersion = event.target.result;
                if (postVersion.text === null) {
                  boostsToRemove.push([boostKey, boostersPost]);
                  resolve2();
                } else {
                  // If it's not a plain boost, we don't have to wait for it to
                  // delete; resolve right away.
                  resolve2();
                }
              };
            };
          }));
          cursor.continue();
        }
      };
    });
  }

  async boost({boostedPostUri, boosterHandle}) {
    // I'd love to remove and then add in the same transaction, but I guess awaiting closes the transaction??
    await this.removeBoostsBy({boosterHandle, boostedPostUri});

    const transaction = this.db.db.transaction(["boosts", "posts", "postVersions"], "readwrite")
    const boostsStore = transaction.objectStore("boosts");
    const postsStore = transaction.objectStore("posts");
    const postVersionsStore = transaction.objectStore("postVersions");

    // Remove any old (non-quote) boosts.
    const promises = [];

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

    promises.push(new Promise(resolve => {
      postsStore.add(newBoostersPost).onsuccess = event => {
        resolve();
      };
    }));

    const newBoostersPostVersion = {
      uri: newPostUri,
      updatedAt: createdAt,
      sensitive: false,
      spoilerText: null,
      language: null, // There's no text, so I don't know what to put here.  Null?
      type: "text",
      text: null,
    };

    promises.push(new Promise(resolve => {
      postVersionsStore.add(newBoostersPostVersion).onsuccess = event => {
        resolve();
      };
    }));

    const newBoost = {
      booster: boosterHandle,
      boostersPost: newPostUri,
      boostedPost: boostedPostUri,
    };

    promises.push(new Promise(resolve => {
      boostsStore.add(newBoost).onsuccess = event => {
        resolve();
      };
    }));


    return Promise.all(promises);
  }

  quoteBoost({boostersPostUri, boostedPostUri, boosterHandle}) {
    const newBoost = {
      booster: boosterHandle,
      boostersPost: boostersPostUri,
      boostedPost: boostedPostUri,
    };

    return this.db.set('boosts', newBoost);
  }

  async addPost(post) {
    const postVersion = {
      uri: post.uri,
      updatedAt: post.updatedAt,
      sensitive: post.sensitive,
      spoilerText: post.spoilerText,
      language: post.language,
      type: post.type,
      text: post.text,
    };

    const newPost = {... post};
    delete newPost.sensitive;
    delete newPost.spoilerText;
    delete newPost.language;
    delete newPost.type;
    delete newPost.text;

    await Promise.all([
      this.db.set('posts', newPost),
      this.db.set('postVersions', postVersion),
    ]);
    return this.get(post.uri);
  }

  async updatePost(post) {
    // It looks like we can just use addPost, in the current database implementation.
    await this.addPost(post);
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

  async getFullPostFromObjectStores(post, {postsStore, postVersionsStore, imageVersionsStore, boostsStore, peopleStore}) {
    // Maybe they don't want the boosted posts and so they didn't pass us the
    // boosts object store.
    if (typeof boostsStore !== "undefined") {
      post.boostedPosts = await this.getBoostedPostsFromObjectStore(post.uri, {postsStore, boostsStore, peopleStore, postVersionsStore, imageVersionsStore});
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

      // We have the image as a data url, because that was the preferred format
      // for showing it in the editing screen.  Now we want it as an
      // Blob because that's the preferred format for storing in the database.
      // Also, we need it as an ArrayBuffer in order to hash it.
      // We can turn the data url into a blob by fetching it like a url.
      const imageDataUrl = image.data;
      const response = await fetch(imageDataUrl);

      if (response.ok) {
        const blob = await response.blob();
        const buffer = await blob.arrayBuffer();
        const imageHash = await sha256(buffer);
        await this.db.set('images', {hash: imageHash, imageBlob: blob});
        delete images[fileName].data;
        images[fileName].image = imageHash;
      }
    }

    const dbImages = {postUri: postUri, updatedAt: updatedAt, files: images};
    await this.db.set('imageVersions', dbImages);
  }

  async getImagesForPost(postUri, versionUpdatedAt, options) {
    // If they pass true for the getImages option, then we actually get the
    // images and insert their data urls as {... data}.  Otherwise, we just
    // leave the hash there and let someone else pull the image data out of the
    // database (like <ClickableImage> for example).
    const getImages = typeof options === "undefined"? false : options.getImages;
    
    const transaction = this.db.db.transaction(["posts", "imageVersions", "images"]);
    const postsStore = transaction.objectStore("posts");
    const imageVersionsStore = transaction.objectStore("imageVersions");
    const imagesStore = transaction.objectStore("images");

    return new Promise(resolve => {
      try {
        postsStore.get(postUri).onsuccess = event => {
          const post = event.target.result;
          if (post.deletedAt !== null) {
            resolve({});
          } else {
            try {
              const latestUpdatedAt = post.updatedAt;

              imageVersionsStore.get([postUri, versionUpdatedAt ?? latestUpdatedAt]).onsuccess = async event => {
                const imageVersion = event.target.result;
                if (typeof imageVersion === "undefined") {
                  resolve({});
                } else {
                  // Do we actually get the image data, or just the hash, and
                  // let someone else grab the image data?
                  if (getImages) {
                    const promises = [];
                    for (const [fileName, file] of Object.entries(imageVersion.files)) {
                      const imageHash = file.image;
                      promises.push(new Promise(async resolve2 => {
                        imageVersion.files[fileName].data = await this.db.getImageDataUrl(imageHash, imagesStore);
                        resolve2();
                      }));
                    }

                    await Promise.all(promises);
                    resolve(imageVersion.files);
                  } else {
                    resolve(imageVersion.files);
                  }
                }
              };
            } catch (error) {
              if (error instanceof DOMException && error.name === "DataError") {
                // The data didn't exist. No big deal.
                resolve({});
              } else {
                throw error;
              }
            }
          }
        };
      } catch (error) {
        if (error instanceof DOMException && error.name === "DataError") {
          // The data didn't exist. No big deal.
          resolve(undefined);
        } else {
          throw error;
        }
      }
    });
  }
}

