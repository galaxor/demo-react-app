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

  const [popularPosts, setPopularPosts] = useState({});

/*
  useEffect(() => {
    const postsByURI = postsDB.get();
    
    setPopularPosts(postsByURI);

    const postsForDisplay = Object.entries(postsByURI).map(([postURI, updatedDate]) => {
      var post = postsDB.get(postURI);
      post.authorPerson = peopleDB.get(post.author);

      return post;
    });

    console.log(postsForDisplay);
  }, [popularPosts, setPopularPosts]);
*/

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
