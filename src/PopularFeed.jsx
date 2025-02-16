import { useContext, useEffect, useState } from 'react';

import DatabaseContext from './DatabaseContext.jsx';

import { PostsDB } from './logic/posts.js';

import PostsList from './PostsList.jsx';

export default function PopularFeed() {
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

  const [postsList, setPostsList] = useState(<PostsListLoading />);

  useEffect(() => {
    (async () => {
      const posts = await postsDB.getFeaturedPosts();
      console.log("popsts", posts);
      setPostsList(<PostsList posts={posts} />);
    })();
  }, []);
  
  return (
    <main>
      <h1 id="featured-feed">All Posts</h1>

      <div role="feed">
        {postsList}
      </div>
    </main>
  );
}

function PostsListLoading() {
  return <>Loading posts...</>;
}
