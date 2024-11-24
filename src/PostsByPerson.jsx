import { useContext } from 'react';

import DatabaseContext from './DatabaseContext.jsx';
import PersonContext from './PersonContext.jsx';
import { PostsDB } from './logic/posts.js';
import PostsList from './PostsList.jsx';

export default function PostsByPerson({showReplies}) {
  const person = useContext(PersonContext);

  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);
  const theirPosts = postsDB.getPostsBy(person.handle, {showReplies});

  return (
    <section className="their-posts" aria-labelledby="their-posts">
      <h2 id="their-posts">Posts by <bdi>{person.displayName}</bdi></h2>

      <PostsList posts={theirPosts} />
    </section>
  );
}
