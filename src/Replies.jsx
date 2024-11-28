import Post from './Post.jsx';
import PostAndReplies from './PostAndReplies.jsx'
import { PostsDB } from './logic/posts.js';
import DatabaseContext from './DatabaseContext.jsx'
import { useContext, useState } from 'react';

export default function Replies({postRepliedTo, prune, replies, setReplies}) {
  return (
    <ul className="replies">
      {replies.map(reply => {
        if (reply.uri === prune) {
          return "";
        } else {
          return (
          <li key={'li-'+reply.uri}>
            <PostAndReplies key={reply.uri} post={reply} />
          </li>
          );
        }
      })
    }
    </ul>
  );
}
