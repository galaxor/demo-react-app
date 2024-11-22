import { useContext, useEffect, useState } from 'react';

import SystemNotificationArea from './SystemNotificationArea.jsx';

import DatabaseContext from './DatabaseContext.jsx';

import People from './logic/people.js';
import PopularPosts from './logic/popularPosts.js';
import Posts from './logic/posts.js';

export default function PopularFeed() {
  const db = useContext(DatabaseContext);
  const postsDB = new Posts(db);
  const popularPostsDB = new PopularPosts(db);
  const peopleDB = new People(db);

  const [postsForDisplay, setPostsForDisplay] = useState(null);

  if (!postsForDisplay) {
    const postsByURI = postsDB.get();
  
    const postsForDisplay = Object.entries(postsByURI).map(([postURI, updatedDate]) => {
      var post = postsDB.get(postURI);
      post.authorPerson = peopleDB.get(post.author);

      return post;
    });

    setPostsForDisplay(postsForDisplay);
  }

  const dateFormat = new Intl.DateTimeFormat(navigator.language, {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short'
  });

  return (
    <main>
      <h1 id="featured-feed">Popular Posts</h1>
      <SystemNotificationArea />

      {postsForDisplay?
        postsForDisplay.map((post) => {
          console.log(post);
          return (
          <article className="post h-entry">
            <span className="post-date">
              Posted
              <a className="post-time dt-published" href={'/post/' + post.uri}>
                  <span className="dt-published published-date">
                    <time datetime={post.createdAt}>{dateFormat.format(new Date(post.createdAt))}</time>
                    {/* This is where I would put the "time ago" */}
                  </span>

                  {post.updatedAt !== post.createdAt ?
                    <span className="dt-updated updated-date">
                      <time datetime={post.updatedAt}>{dateFormat.format(new Date(post.updatedAt))}</time>
                      {/* This is where I would put the "time ago" */}
                    </span>
                    :
                    ''
                  }
              </a>
            </span>
                
            <span className="post-author">
              By
              <a className="p-author h-card" href={'/people/' + post.authorPerson.handle}>
                {post.authorPerson.avatar? 
                  <img alt="" className="avatar-small" href={post.authorPerson.avatar} />
                  :
                  ''
                }
                <bdi className="author-displayName">{post.authorPerson.displayName}</bdi>
                <span className="author-handle">{post.authorPerson.handle}</span>
              </a>
            </span>

            <div className="post-text e-content" lang={post.language}>{post.text}</div>
          </article>
          );
        })
      :
        'No posts to display.'
      }
    </main>
  );
}
