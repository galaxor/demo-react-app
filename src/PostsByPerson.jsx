import DatabaseContext from './DatabaseContext.jsx';
import { PostsDB } from './logic/posts.js';
import PostsList from './PostsList.jsx';
import { useContext } from 'react';

export default function PostsByPerson({person}) {
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);
  const theirPosts = postsDB.getPostsBy(person.handle);

  return (
    <section className="their-posts" aria-labelledby="their-posts">
      <h2 id="their-posts">Posts by <bdi>{person.displayName}</bdi></h2>

      <PostsList posts={theirPosts} />
    </section>
  );
}
