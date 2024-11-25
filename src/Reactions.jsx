import { useContext } from 'react'

import DatabaseContext from './DatabaseContext.jsx'
import { PostsDB } from './logic/posts.js';

export default function Reactions({post}) {
  // The detail view would be drawn by the PostSingle page.
  // And maybe be given a special route.

  // "reactionTotals" should be a reactive value and we can add things to it with state, by reacting to the post.

  // "react" will be like a react row from the database in that it will have type, unicode, reactName, and reactServer.
  // But we also add total (a number).
  // And we add youToo (a boolean), true if you reacted this react.

  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);
  const initialReactionTotals = postsDB.getReactionsTo(post.uri);

  console.log(initialReactionTotals);

  return "OK";


  const htmlId = encodeURIComponent(post.uri);
  return (
    <aside className="reactions" aria-labelledby={htmlId}>
      <span id={htmlId} className="reactions-header">Reactions</span>
      <ul aria-labelledBy={htmlId}>
        {reactionTotals.map(([react, total]) =>
          <li key={[react.type, react.unicode, react.reactServer].join('-')}>
            <Reaction react={react} total={total} />
          </li>
        )}
      </ul>
    </aside>
  );
}
