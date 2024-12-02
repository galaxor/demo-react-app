import Post from './Post.jsx';
import PostAndReplies from './PostAndReplies.jsx'
import { PostsDB } from './logic/posts.js';
import DatabaseContext from './DatabaseContext.jsx'
import { useContext, useEffect, useRef, useState } from 'react';

import './static/Replies.css'

export default function Replies({postRepliedTo, prune, replies, setReplies}) {
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
    <ul ref={listRef} className="replies">
      {replies.map(reply => {
        if (reply.uri === prune) {
          return "";
        } else {
          return (
          <li key={'li-'+reply.uri}>
            <PostAndReplies key={reply.uri} post={reply} prune={prune} />
          </li>
          );
        }
      })
    }
    </ul>
  );
}
