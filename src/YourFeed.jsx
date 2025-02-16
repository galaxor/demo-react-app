import { useContext, useEffect, useState } from 'react'

import DatabaseContext from './DatabaseContext'
import { PostsDB } from './logic/posts.js'
import PostsList from './PostsList.jsx'
import UserContext from './UserContext.jsx'

export default function YourFeed() {
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);
  const { user } = useContext(UserContext);

  const [postsList, setPostsList] = useState(<PostsListLoading />);

  useEffect(() => {
    (async () => {
      if (user) {
        const friendsPosts = await postsDB.friendsFeed(user);
        console.log(friendsPosts);
        setPostsList(<PostsList posts={friendsPosts} />);
      }
    })();
  }, [user]);
  
  return (
    <main>
      <h1 id="your-feed">Your Feed</h1>

      <div role="feed">
        {postsList}
      </div>
    </main>
  );
}

function PostsListLoading() {
  return <>Loading posts...</>;
}
