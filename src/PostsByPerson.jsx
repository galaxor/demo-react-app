import { useContext, useState } from 'react';
import {Switch} from "@nextui-org/react";

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
      <h2 id="their-posts" className="text-2xl font-bold my-4">Posts by <bdi>{person.displayName}</bdi></h2>

      <Switch className="show-boosts mb-4"
        isSelected={showBoosts} onValueChange={checked => setShowBoosts(checked)}
      >
        Show Boosts
      </Switch>

      <PostsList posts={theirPosts} />
    </section>
  );
}
