import { useContext, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import EmojiPicker from 'emoji-picker-react';
import { PostsDB } from './logic/posts.js';

import DatabaseContext from './DatabaseContext.jsx';
import { toggleReaction } from './toggle-reaction.js';
import UserContext from './UserContext.jsx';

import emojiData from 'emoji-datasource-twitter/emoji_pretty.json'

export default function ReactionsMenu({htmlId, post, reactionTotals, setReactionTotals, yourReactions, setYourReactions}) {
  const { user } = useContext(UserContext);
  const dialogRef = useRef(null);

  const [ menuOpen, setMenuOpen ] = useState(false);

  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

  return (
    <>
    <Link id={htmlId} onClick={e => setMenuOpen(!menuOpen)}>Add a reaction</Link>
    <EmojiPicker open={menuOpen} 
      onEmojiClick={emoji =>
        addEmojiReaction({emoji, user, postsDB, post, reactionTotals, setReactionTotals, yourReactions, setYourReactions, setMenuOpen})
      }
      getEmojiUrl={(x) => "/emoji-datasource-twitter/twitter/64/"+x+".png"} />
    </>
  );
}

function addEmojiReaction({emoji, user, postsDB, post, reactionTotals, setReactionTotals, yourReactions, setYourReactions, setMenuOpen}) {
  // construct reaction here, based on "emoji".

console.log(emoji);

  const reaction = {
    reactorHandle: user.handle,
    reactingTo: post.uri,
    type: "url",
    unicode: emoji.emoji,
    reactName: null,
    reactServer: null,
    altText: emoji.names[0],
    reactUrl: emoji.imageUrl,
  };

console.log("Adding to db", reaction);

  toggleReaction({user, postsDB, post, reaction, reactionTotals, setReactionTotals, newValue: true, yourReactions, setYourReactions});

  setMenuOpen(false);
}
