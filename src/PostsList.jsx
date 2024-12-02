import { useEffect, useRef } from 'react'

import Post from './Post.jsx'
import PostAndYourNewReplies from './PostAndYourNewReplies.jsx'

export default function PostsList({posts}) {
  const listRef = useRef(null);

  function clickPost(e) {
    // A little old-school javascript to pass the clicks to the link that goes to
    // the post's PostSingle page.
    if (e.target.nodeName === "A") {
      return false;
    } else {
      var node = e.target;
      for ( ; node.nodeName !== "ARTICLE"; node = node.parentElement) { }
      node.querySelector('a.post-time').click();
    }
  }

  // Make it so when you click a post, you go to its PostSingle page.
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
        {posts.map((post) => { 
            return (
              <PostAndYourNewReplies key={post.uri} post={post} />
            );
          })}
        </>

        :
        <> No posts to display. </>
      }

    </div>
  );
}
