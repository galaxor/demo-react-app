import { useContext, useState } from 'react'

import DatabaseContext from './DatabaseContext.jsx'
import { PostsDB } from './logic/posts.js';

export default function NumReplies({post, knownReplies}) {
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);
  const replies = knownReplies ?? postsDB.getRepliesTo(post.uri);

  const [numReplies, setNumReplies] = useState(null);

  return (
    <span className="num-replies" aria-label="Replies">
      <span className="num-replies-icon">💬</span>
      <span className="num-replies-num">{numReplies ?? replies.length}</span>
    </span>
  );
}
