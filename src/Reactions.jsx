import { useContext, useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'

import DatabaseContext from './DatabaseContext.jsx'
import { PostsDB } from './logic/posts.js';
import Reaction from './Reaction.jsx';
import ReactionsMenu from './ReactionsMenu.jsx';
import UserContext from './UserContext.jsx';

export default function Reactions({post, onReact}) {
  // The detail view would be drawn by the PostSingle page.
  // And maybe be given a special route.

  // "reactionTotals" should be a reactive value and we can add things to it with state, by reacting to the post.

  // "react" will be like a react row from the database in that it will have type, unicode, reactName, reactServer, altText, and reactUrl.
  // But we also add total (a number).
  // And we add youToo (a boolean), true if you reacted this react.

  const { user } = useContext(UserContext);

  // We're going to make the totals into a state variable so you can change them by clicking.
  // We have to pass it to the <Reaction> component, because that's what you'll be clicking on.
  const [reactionTotals, setReactionTotals] = useState([]);

  const [yourReactions, setYourReactions] = useState([]);

  const db = useContext(DatabaseContext);

  useEffect(() => {
    (async () => {
      const postsDB = new PostsDB(db);
      const reactionTotals = await postsDB.getReactionsTo(post.uri);
      const yourReactions = await postsDB.getReactionsByPerson(user.handle, post.uri);

      setReactionTotals(reactionTotals);
      setYourReactions(yourReactions);
    })();
  }, [user]);

  const htmlId = encodeURIComponent(post.uri)+'-reactions';
  return (
    <>
      <ul className="reactions flex flex-wrap" aria-labelledby={htmlId}>
        {reactionTotals.map(reaction =>
          <li className="reaction" key={[reaction.type, reaction.unicode, reaction.reactServer, reaction.reactUrl].join('-')}>
            <Reaction post={post} reaction={reaction} 
              reactionTotals={reactionTotals} 
              setReactionTotals={setReactionTotals}
              yourReactions={yourReactions}
              setYourReactions={setYourReactions}
              onReact={onReact}
            />
          </li>
        )}
        {user && 
          <li className="add-a-reaction">
            <ReactionsMenu 
              htmlId={htmlId+'-add'}
              post={post} 
              reactionTotals={reactionTotals} 
              setReactionTotals={setReactionTotals}
              yourReactions={yourReactions}
              setYourReactions={setYourReactions}
              onReact={onReact}
            />
          </li>
        }
      </ul>
    </>
  );
}
