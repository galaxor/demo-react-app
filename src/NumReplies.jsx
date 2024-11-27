import { useContext, useState } from 'react'
import { Link } from 'react-router-dom'

import DatabaseContext from './DatabaseContext.jsx'
import { PostsDB } from './logic/posts.js';
import UserContext from './UserContext.jsx'

export default function NumReplies({post, knownReplies, setComposingReply, numReplies}) {
  const user = useContext(UserContext);
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);
  const replies = knownReplies ?? postsDB.getRepliesTo(post.uri);

  const iconAndNumber = (<>
    <span className="num-replies-icon">💬</span>
    <span className="num-replies-num">{numReplies ?? replies.length}</span>
  </>);

  return (user?
    <Link className="num-replies" aria-label="Replies" to="/" onClick={(e) => { e.preventDefault(); setComposingReply(true); }}>
      {iconAndNumber}
    </Link>
    :
    <span className="num-replies" aria-label="Replies">
      {iconAndNumber}
    </span>
  );
}
