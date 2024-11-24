import { useContext, useState } from 'react';

import DatabaseContext from './DatabaseContext.jsx';
import PersonContext from './PersonContext.jsx';
import { PostsDB } from './logic/posts.js';
import PostsList from './PostsList.jsx';

export default function PostsByPerson({showReplies}) {
  const [ showBoosts, setShowBoosts ] = useState(true);

  const person = useContext(PersonContext);

  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);
  const theirPosts = postsDB.getPostsBy(person.handle, {showReplies, includeBoosts: showBoosts});


  return (
    <section className="their-posts" aria-labelledby="their-posts">
      <h2 id="their-posts">Posts by <bdi>{person.displayName}</bdi></h2>

      <label className="show-boosts">Show Boosts
        <input type="checkbox" checked={showBoosts} onChange={(e) => setShowBoosts(e.target.checked)} />
      </label>

      <PostsList posts={theirPosts} />
    </section>
  );
}
