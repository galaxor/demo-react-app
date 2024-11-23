import { useContext, useEffect, useState } from 'react';

import SystemNotificationArea from './SystemNotificationArea.jsx';

import DatabaseContext from './DatabaseContext.jsx';

import PeopleDB from './logic/people.js';
import PopularPostsDB from './logic/popularPosts.js';
import PostsDB from './logic/posts.js';

import PostsList from './PostsList.jsx';

export default function PopularFeed() {
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);
  const popularPostsDB = new PopularPostsDB(db);
  const peopleDB = new PeopleDB(db);

  const [postsForDisplay, setPostsForDisplay] = useState(null);

  if (!postsForDisplay) {
    const postsByURI = popularPostsDB.get();
  
    const postsForDisplay = postsByURI.map(popularPost => {
      var post = postsDB.get(popularPost.uri);
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
