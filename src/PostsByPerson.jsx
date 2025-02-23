import { useContext, useEffect, useState } from 'react';
import {Switch} from "@nextui-org/react";

import DatabaseContext from './DatabaseContext.jsx';
import PersonContext from './PersonContext.jsx';
import { PostsDB } from './logic/posts.js';
import PostsList from './PostsList.jsx';

// import theirPosts from './staticList.js'

export default function PostsByPerson({showReplies}) {
  const [ showBoosts, setShowBoosts ] = useState(true);
  const [theirPosts, setTheirPosts] = useState(<PostsByPersonLoading />);

  const { person } = useContext(PersonContext);

  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

  useEffect(() => {
    (async () => {
      const theirPosts = await postsDB.getPostsBy(person.handle, {showReplies, includeBoosts: showBoosts});
      setTheirPosts(<PostsList posts={theirPosts} />);
    })();
  }, [showBoosts]);

  return (
    <section className="their-posts" aria-labelledby="their-posts">
      <h2 id="their-posts" className="text-2xl font-bold my-4">Posts by <bdi>{person.displayName}</bdi></h2>

      <Switch className="show-boosts mb-4"
        isSelected={showBoosts} onValueChange={checked => setShowBoosts(checked)}
      >
        Show Boosts
      </Switch>

      {theirPosts}
    </section>
  );
}

function PostsByPersonLoading() {
  return (<>Loading posts...</>);
}
