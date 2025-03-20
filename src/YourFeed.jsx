import { useContext, useEffect, useState } from 'react'

import DatabaseContext from './DatabaseContext'
import PostOfficeContext from './context/PostOfficeContext.jsx'
import { PostsDB } from './logic/posts.js'
import PostsList from './PostsList.jsx'
import UserContext from './UserContext.jsx'

export default function YourFeed() {
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);
  const { user } = useContext(UserContext);

  const postOffice = useContext(PostOfficeContext);

  const [postsList, setPostsList] = useState(<PostsListLoading />);

  useEffect(() => {
    (async () => {
      if (user) {
        const friendsPosts = await postsDB.friendsFeed(user);
        setPostsList(<PostsList posts={friendsPosts} />);
        postOffice.send({command: 'ding', message: 'robobobot'}, response => console.log("rsprsp", response));

        console.log("DBDB", db.db);
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
