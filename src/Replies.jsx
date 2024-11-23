import Post from './Post.jsx';
import PostsDB from './logic/posts.js';
import DatabaseContext from './DatabaseContext.jsx'
import { useContext } from 'react';

export default function Replies({postRepliedTo}) {
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

  const replies = postsDB.getRepliesTo(postRepliedTo.uri);

  const dateFormat = new Intl.DateTimeFormat(navigator.language, {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short'
  });

  return (
    <ul className="replies">
      {replies.map(reply => <li><Post key={reply.uri} post={reply} dateFormat={dateFormat} /></li>)}
    </ul>
  );
}
