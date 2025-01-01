import { useContext } from 'react'

import DatabaseContext from './DatabaseContext'
import { PostsDB } from './logic/posts.js'
import PostsList from './PostsList.jsx'
import SystemNotificationArea from './SystemNotificationArea.jsx';
import UserContext from './UserContext.jsx'

export default function YourFeed() {
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);
  const { user } = useContext(UserContext);

  const friendsPosts = postsDB.friendsFeed(user);
  
  return (
    <main>
      <h1 id="your-feed">Your Feed</h1>
      <SystemNotificationArea />

      <div role="feed">
        <PostsList posts={friendsPosts} />
      </div>
    </main>
  );
}
