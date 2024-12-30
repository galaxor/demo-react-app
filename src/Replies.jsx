import Corner from './components/corner-svg.jsx'
import hashSum from 'hash-sum'
import Post from './Post.jsx';
import PostAndReplies from './PostAndReplies.jsx'
import { PostsDB } from './logic/posts.js';
import DatabaseContext from './DatabaseContext.jsx'
import { useContext, useEffect, useRef, useState } from 'react';

import { clickPost } from './clickPost.js'
import './static/Replies.css'

export default function Replies({postRepliedTo, prune, replies, setReplies}) {
  const listRef = useRef(null);

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
  });


  return (
    <ul ref={listRef} className="replies">
      {replies.map(reply => {
        if (reply.uri === prune) {
          return "";
        } else {
          return (
          <li key={'li-'+reply.uri}>
            <a href={"#"+hashSum(postRepliedTo.uri)} className="thread-handle"><Corner /></a>
            <a href={"#"+hashSum(reply.uri)} className="collapsed-thread-handle"></a>
            <PostAndReplies key={reply.uri} id={hashSum(reply.uri)} post={reply} prune={prune} />
          </li>
          );
        }
      })
    }
    </ul>
  );
}
