import { useEffect, useRef } from 'react'

import { clickPost } from './clickPost.js'
import Post from './Post.jsx'
import PostAndYourNewReplies from './PostAndYourNewReplies.jsx'

export default function PostsList({posts, onDelete}) {
  const listRef = useRef(null);

  // Make it so when you click a post, you go to its Thread page.
  useEffect(() => {
    const clickablePosts = listRef.current.querySelectorAll('article.post > div.post')

    clickablePosts.forEach(node => {
      node.addEventListener('click', clickPost);
    });

    return(() => {
      clickablePosts.forEach(node => {
        node.removeEventListener('click', clickPost);
      });
    });
  }, []);

  return (
    <div ref={listRef} className={"posts-list" + (posts.length === 0? " no-posts" : "")}>
      {(posts && posts.length > 0) ?
        <>
        {posts.map(post => { 
            return (
              <PostAndYourNewReplies key={post.uri} post={post} onDelete={onDelete} isMainPost={true} />
            );
            /*
            return (
              <Post key={post.uri} post={post} onDelete={onDelete} isMainPost={true} />
            );
            */
          })}
        </>

        :
        <> No posts to display. </>
      }

    </div>
  );
}
