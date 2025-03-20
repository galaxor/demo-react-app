import { useContext, useEffect, useState } from 'react';
import {Switch} from "@nextui-org/react";

import DatabaseContext from './DatabaseContext.jsx';
import PersonContext from './PersonContext.jsx';
import { PostsDB } from './logic/posts.js';
import PostsList from './PostsList.jsx';
import PostOfficeContext from './context/PostOfficeContext.jsx'


// import theirPosts from './staticList.js'

export default function PostsByPerson({showReplies}) {
  const [ showBoosts, setShowBoosts ] = useState(true);
  const [theirPosts, setTheirPosts] = useState(null);

  const { person } = useContext(PersonContext);

  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

  const worker = useContext(PostOfficeContext);

  useEffect(() => {
    (async () => {
      // Show the posts we already know about.
      console.log("I will print the posts by", person.handle);
      const theirPosts = await postsDB.getPostsBy(person.handle, {showReplies, includeBoosts: showBoosts});
      setTheirPosts(theirPosts);

      // Get more posts from the API.
      worker.send(
        {
          command: "getPostsBy",
          handle: person.handle,
          minId: theirPosts.length === 0? undefined : theirPosts[0].serverId,
        }, 
        posts => {
          console.log("I got these posts", posts);
        }
      );
      
    })();
  }, [showBoosts, showReplies]);

  return (
    <section className="their-posts" aria-labelledby="their-posts">
      <h2 id="their-posts" className="text-2xl font-bold my-4">Posts by <bdi>{person.displayName}</bdi></h2>

      <Switch className="show-boosts mb-4"
        isSelected={showBoosts} onValueChange={checked => setShowBoosts(checked)}
      >
        Show Boosts
      </Switch>

      {theirPosts === null? <>Loading...</>
        : <PostsList posts={theirPosts} onDelete={post => {
            const newTheirPosts = theirPosts.filter(theirPost => theirPost.uri !== post.uri);
            setTheirPosts(newTheirPosts);
          }} />
      }
    </section>
  );
}
