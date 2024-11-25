import { useContext, useState } from 'react'

import DatabaseContext from './DatabaseContext.jsx'
import { PostsDB } from './logic/posts.js';
import Reaction from './Reaction.jsx';
import UserContext from './UserContext.jsx';

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

  const { user } = useContext(UserContext);

  const initialYourReactions = user? postsDB.getReactionsByPerson(user.handle, post.uri) : [];

  // We're going to make the totals into a state variable so you can change them by clicking.
  // We have to pass it to the <Reaction> component, because that's what you'll be clicking on.
  const [reactionTotals, setReactionTotals] = useState(initialReactionTotals);
  const [yourReactions, setYourReactions] = useState(initialYourReactions);

  const htmlId = encodeURIComponent(post.uri);
  return (
    <aside className="reactions" aria-labelledby={htmlId}>
      <span id={htmlId} className="reactions-header">Reactions</span>
      <ul aria-labelledby={htmlId}>
        {reactionTotals.map(reaction =>
          <li key={[reaction.type, reaction.unicode, reaction.reactServer].join('-')}>
            <Reaction post={post} reaction={reaction} 
              reactionTotals={reactionTotals} 
              setReactionTotals={setReactionTotals}
              yourReactions={yourReactions}
              setYourReactions={setYourReactions}
            />
          </li>
        )}
      </ul>
    </aside>
  );
}
