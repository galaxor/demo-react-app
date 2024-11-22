import { useContext, useEffect, useState } from 'react';

import SystemNotificationArea from './SystemNotificationArea.jsx';

import DatabaseContext from './DatabaseContext.jsx';

import People from './logic/people.js';
import PopularPosts from './logic/popularPosts.js';
import Posts from './logic/posts.js';

import PostsList from './PostsList.jsx';

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

      <PostsList posts={postsForDisplay} />
    </main>
  );
}
