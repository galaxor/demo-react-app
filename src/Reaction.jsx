import { useContext } from 'react';
import { Link } from 'react-router-dom';

import DatabaseContext from './DatabaseContext.jsx'
import { PostsDB } from './logic/posts.js';
import ReactionGlyph from './ReactionGlyph.jsx'
import { toggleReaction } from './toggle-reaction.js';
import UserContext from './UserContext.jsx';

import './static/Reaction.css';

// We have the State variables reactionTotals and setReactionTotals so we can
// use them in the onClick handler to create reactions.
export default function Reaction({post, reaction, reactionTotals, setReactionTotals, yourReactions, setYourReactions}) {
  const glyph = <ReactionGlyph reaction={reaction} />;

  const { user } = useContext(UserContext);

  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

  // Is this type of reaction among those listed, which you did on this post?
  const didYouDoThis = user?
    typeof yourReactions.find(yourReaction => 
        yourReaction.reactorHandle === user.handle
        && yourReaction.reactingTo === post.uri
        && yourReaction.type === reaction.type 
        && yourReaction.unicode === reaction.unicode
        && yourReaction.reactName === reaction.reactName
        && yourReaction.reactServer === reaction.reactServer
        && yourReaction.reactUrl === reaction.reactUrl
    ) !== "undefined"
    : false
  ;

  // If they're not logged in, they don't get a clickable link.
  return (
    user? 
      <Link className={'reaction ' + (didYouDoThis? 'you-did-this' : '')}
        onClick={e => {
          e.preventDefault();
          toggleReaction({user, postsDB, post, reaction, reactionTotals, setReactionTotals, yourReactions, setYourReactions,
            newValue: !didYouDoThis});
        }
      }>
        <span className="glyph">{glyph}</span>
        {reaction.total && <span className="count">{reaction.total}</span>}
      </Link>
    :
      <div className="reaction">
        <span className="glyph">{glyph}</span>
        {reaction.total && <span className="count">{reaction.total}</span>}
      </div>
  );
}
