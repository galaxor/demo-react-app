import { useContext } from 'react'

import DatabaseContext from './DatabaseContext.jsx'
import { PostsDB } from './logic/posts.js'

function getReplyLevel(post, postsDB) {
  if (post.inReplyTo === null) {
    return 0;
  } else {
    return 1 + getReplyLevel(postsDB.get(post.inReplyTo), postsDB);
  }
}

function nextReplies(replyLevel, children) {
  if (replyLevel === 0) {
    return children;
  } else {
    return (
        <ul className="replies">
          <li>
            <div className="post-and-replies">
              {nextReplies(replyLevel-1, children)}
            </div>
          </li>
        </ul>
    );
  }
}

export default function ReplyLevel({post, children}) {
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

  const replyLevel = getReplyLevel(post, postsDB);
  return nextReplies(replyLevel, children);
}
