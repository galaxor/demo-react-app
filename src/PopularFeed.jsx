import { useContext, useState } from 'react';

import SystemNotificationArea from './SystemNotificationArea.jsx';

import DatabaseContext from './DatabaseContext.jsx';

import PopularPostsDB from './logic/popularPosts.js';

import PostsList from './PostsList.jsx';

export default function PopularFeed() {
  const db = useContext(DatabaseContext);
  const popularPostsDB = new PopularPostsDB(db);

  const [postsForDisplay, setPostsForDisplay] = useState(null);

  if (!postsForDisplay) {
    const postsForDisplay = popularPostsDB.getAll();
    setPostsForDisplay(postsForDisplay);
  }

  return (
    <main>
      <h1 id="featured-feed">Popular Posts</h1>
      <SystemNotificationArea />

      <PostsList posts={postsForDisplay} />
    </main>
  );
}
