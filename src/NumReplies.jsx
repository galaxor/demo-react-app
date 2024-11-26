import { useContext, useState } from 'react'

import DatabaseContext from './DatabaseContext.jsx'
import { PostsDB } from './logic/posts.js';

export default function NumReplies({post, knownReplies}) {
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);
  const replies = knownReplies ?? postsDB.getRepliesTo(post.uri);

  const [numReplies, setNumReplies] = useState();

  return (
    <span className="num-replies">Replies: 0</span>
  );
}
