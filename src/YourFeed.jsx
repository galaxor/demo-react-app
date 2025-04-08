import { useContext, useEffect, useState } from 'react'

import DatabaseContext from './DatabaseContext'
import NewPosts from './components/NewPosts.jsx'
import WorkerContext from './context/WorkerContext.jsx'
import { PostsDB } from './logic/posts.js'
import PostsList from './PostsList.jsx'
import UserContext from './UserContext.jsx'

export default function YourFeed() {
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);
  const { user } = useContext(UserContext);

  const {worker} = useContext(WorkerContext);

  const [postsList, setPostsList] = useState(null);

  const [newPosts, setNewPosts] = useState([]);

  useEffect(() => {
    (async () => {
      if (user) {
        const friendsPosts = await postsDB.friendsFeed(user);
        setPostsList(friendsPosts);

        worker.send(
          { 
            command: 'getYourFeed',
            minId: friendsPosts.length === 0? undefined : friendsPosts[0].serverId,
          },
          response => {
            console.log("These are the posts to display", response);
            setNewPosts([...response, ...newPosts]);
          }
        );
      }
    })();
  }, [user]);
  
  return (
    <main>
      <h1 id="your-feed">Your Feed</h1>

      <NewPosts newPosts={newPosts} setNewPosts={setNewPosts} onClick={event => setPostsList([...newPosts, postsList])} />

      <div role="feed">
        {postsList === null?
          <PostsListLoading />
          : <PostsList posts={postsList} />
        }
      </div>
    </main>
  );
}

function PostsListLoading() {
  return <>Loading posts...</>;
}
