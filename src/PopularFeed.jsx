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

    console.log("PFD", postsForDisplay);
  }

  return (
    <main>
      <h1 id="featured-feed">Popular Posts</h1>
      <SystemNotificationArea />
      <ul aria-describedby="featured-feed">
        <li><article>Test post 1 by person</article></li>
        <li><article>Test post 2 by other person</article></li>
      </ul>
    </main>
  );
}
