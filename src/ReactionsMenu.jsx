import { useContext, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EmojiPicker from 'emoji-picker-react';
import { PostsDB } from './logic/posts.js';

import DatabaseContext from './DatabaseContext.jsx';
import { toggleReaction } from './toggle-reaction.js';
import User from './logic/user.js';
import UserContext from './UserContext.jsx';

import emojiData from 'emoji-datasource-twitter/emoji_pretty.json'

export default function ReactionsMenu({htmlId, post, reactionTotals, setReactionTotals, yourReactions, setYourReactions}) {
  const { user, setUser } = useContext(UserContext);
  const addAReactionRef = useRef(null);

  const [ menuOpen, setMenuOpen ] = useState(false);

  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

  const [skinTone, useSkinTone] = useState();

  // Pressing escape causes the reactions dialog to close
  useEffect(() => {
    function escKeyHandler(e) {
      if (e.key == 'Escape') {
        setMenuOpen(false);
        addAReactionRef.current.focus();
      }
    }

    if (menuOpen) {
      window.addEventListener('keyup', escKeyHandler);
    }

    return () => {
      window.removeEventListener('keyup', escKeyHandler); 
    };
    
  }, [menuOpen, setMenuOpen]);

  // Clicking outside the notifications box causes it to close
  useEffect(() => {
    function clickHandler(e) {
      const emojiPicker = document.querySelector('.emoji-picker');

      if (menuOpen && emojiPicker && !document.querySelector('.emoji-picker').contains(e.target)) {
        setMenuOpen(false);
        addAReactionRef.current.focus();
      }
    }

    if (menuOpen) {
      window.addEventListener('click', clickHandler);
    }

    return () => { 
      window.removeEventListener('click', clickHandler); 
    };
  }, [menuOpen, setMenuOpen]);

  return (
    <>
    <Link id={htmlId} ref={addAReactionRef} onClick={e => setMenuOpen(!menuOpen)}>Add a reaction</Link>
    <EmojiPicker className="emoji-picker" open={menuOpen} 
      defaultSkinTone={typeof skinTone==="undefined"? user.skinTonePref : skinTone}
      onEmojiClick={emoji =>
        addEmojiReaction({emoji, user, postsDB, post, reactionTotals, setReactionTotals, yourReactions, setYourReactions, setMenuOpen, addAReactionRef})
      }
      onSkinToneChange={newTone => skinToneChange({newTone, user, setUser})}
      getEmojiUrl={(x) => "/emoji-datasource-twitter/twitter/64/"+x+".png"} />
    </>
  );
}

function addEmojiReaction({emoji, user, postsDB, post, reactionTotals, setReactionTotals, yourReactions, setYourReactions, setMenuOpen, addAReactionRef}) {
  // construct reaction here, based on "emoji".

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

  toggleReaction({user, postsDB, post, reaction, reactionTotals, setReactionTotals, newValue: true, yourReactions, setYourReactions});

  setMenuOpen(false);
  addAReactionRef.current.focus();
}

function skinToneChange({newTone, user, setUser}) {
  const newUser = User.setSkinTone(newTone);
  setUser(newUser);
}
