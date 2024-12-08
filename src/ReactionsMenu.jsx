import { Button } from "@nextui-org/button"
import { useContext, useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EmojiPicker from 'emoji-picker-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Popover, PopoverTrigger, PopoverContent } from "@nextui-org/popover";
import { PostsDB } from './logic/posts.js';

import DatabaseContext from './DatabaseContext.jsx';
import icons from './icons.js'
import { toggleReaction } from './toggle-reaction.js';
import User from './logic/user.js';
import UserContext from './UserContext.jsx';

import emojiData from 'emoji-datasource-twitter/emoji_pretty.json'

function opennessFunction(menuOpen, setMenuOpen, menuLockedOpen, setMenuLockedOpen) {
  return function setOpenness(openness) {
    // If we're opening the menu, don't let it close until some time has elapsed.
    // This is a workaround for a bug where nextui's popovers close when you
    // scroll, but the emoji picker scrolls when you open it.
    if (menuOpen === false && openness === true) {
      setMenuLockedOpen(true);
    }

    if (openness === true || menuLockedOpen === false) {
      setMenuOpen(openness);
    }
  }
}

export default function ReactionsMenu({htmlId, post, reactionTotals, setReactionTotals, yourReactions, setYourReactions, onReact}) {
  const { user, setUser } = useContext(UserContext);

  const [ menuOpen, setMenuOpen ] = useState(false);

  // Nextui's popovers close as soon as you scroll, and emojipicker scrolls
  // when you open it (at least, on first render?).
  // I couldn't find a simple way to hook in and change either behavior, so I'm
  // just going to lock the emojipicker open for 200ms every time it opens.
  const [ menuLockedOpen, setMenuLockedOpen ] = useState(false);
  useEffect(() => {
    var timeout;
    if (menuLockedOpen) {
      timeout = setTimeout(() => setMenuLockedOpen(false), 200);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [ menuLockedOpen, setMenuLockedOpen ]);

  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

  const [skinTone, useSkinTone] = useState();

  return (
    <>
    <Popover isOpen={menuOpen} onOpenChange={opennessFunction(menuOpen, setMenuOpen, menuLockedOpen, setMenuLockedOpen)}>
    {/* <Popover placement="bottom" isOpen={menuOpen}> */}
      <PopoverTrigger>
        <Button size="sm" variant="light" id={htmlId}>
          <FontAwesomeIcon title="Add a reaction" icon={icons.squarePlus} size="lg" />
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <EmojiPicker className="emoji-picker" open={true}
          defaultSkinTone={typeof skinTone==="undefined"? user.skinTonePref : skinTone}
          onEmojiClick={emoji => {
            addEmojiReaction({emoji, user, postsDB, post, reactionTotals, setReactionTotals, yourReactions, setYourReactions, setMenuOpen});
            if (typeof onReact === 'function') { onReact(); }
          }}
          onSkinToneChange={newTone => skinToneChange({newTone, user, setUser})}
        />
      </PopoverContent>
    </Popover>
    </>
  );
}

// This is how we tell it to not use the CDN.  Unfortunately, in github pages,
// it was not liking that we were making so many image requests, so I guess for
// now, we'll use the CDN, and I'll put in a pull request to fix this thing up
// to use sprite sheets.
// getEmojiUrl={(x) => "/emoji-datasource-twitter/twitter/64/"+x+".png"} />

function addEmojiReaction({emoji, user, postsDB, post, reactionTotals, setReactionTotals, yourReactions, setYourReactions, setMenuOpen}) {
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
}

function skinToneChange({newTone, user, setUser}) {
  const newUser = User.setSkinTone(newTone);
  setUser(newUser);
}
