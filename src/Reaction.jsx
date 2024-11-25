import { useContext } from 'react';
import { Link } from 'react-router-dom';

import DatabaseContext from './DatabaseContext.jsx'
import { PostsDB } from './logic/posts.js';
import UserContext from './UserContext.jsx';

function reactionGlyph(reaction) {
  // The template for the react is:
  // {
  //   type: "like",
  //   unicode: null,
  //   reactName: null,
  //   reactServer: null,
  //   createdAt: "2024-11-21T07:35:00+01:00",
  // }

  // The type field can be one of: "like", "dislike", "unicode", "react"
  // If it's "dislike", that's a Lemmy downvote.
  // If it's "unicode", then the unicode field should have one unicode emoji in it.
  // If it's "react", then reactname will be something like "neofox"
  //   and the server will be whatever server neofox comes from.
  //   I don't really know how that works, that's just what I gleaned
  //   from looking at misskey, which I want to interact with.

  switch (reaction.type) {
  case 'like': return '⭐️';

  // XXX I'll have to validate this sometime by allowlisting certain emojis.  Otherwise, they could react with a whole post!
  // Counting "characters" in unicode isn't really a thing that's possible.
  // What is the boundary of a character?  So many accents and other type of
  // modifiers.
  // Take a look at https://coolaj86.com/articles/how-to-count-unicode-characters-in-javascript/
  case 'unicode': return reaction.unicode; 

  // XXX I haven't implemented rich reactions at all.
  case 'react': return '?';
  }
}

function toggleReaction({user, postsDB, post, reaction, reactionTotals, setReactionTotals, newValue}) {
  const createdAt = new Date();

  // Make the change in the database
  postsDB.setReaction({reactorHandle: user.handle, reactingTo: post.uri, reaction, createdAt, newValue});

  // Construct a new reactionTotals object, which has 1 either added to or
  // subtracted from the existing total for this reaction.
  // Set that in the state variable, so it can be seen in the post.
  const newReactionTotals = reactionTotals.map(reactionTotal => {
    if (reactionTotal.type === reaction.type
        && reactionTotal.unicode === reaction.unicode
        && reactionTotal.reactName === reaction.reactName
        && reactionTotal.reactServer === reaction.reactServer)
    {
      return {
        ...reactionTotal,
        total: newValue? reactionTotal.total-1 : reactionTotal.total+1,
      };
    } else {
      return {...reactionTotal};
    }
  });

  console.log("I just set it to", newReactionTotals);

  setReactionTotals(newReactionTotals);
}

// We have the State variables reactionTotals and setReactionTotals so we can
// use them in the onClick handler to create reactions.
export default function Reaction({post, reaction, reactionTotals, setReactionTotals}) {
  const glyph = reactionGlyph(reaction);

  const { user } = useContext(UserContext);

  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

  // If they're not logged in, they don't get a clickable link.
  return (
    user? 
      <Link className="reaction" onClick={e => {
        e.preventDefault();
        toggleReaction({user, postsDB, post, reaction, reactionTotals, setReactionTotals, newValue: e.target.clicked});
      }}>
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
