import { PostsDB } from './logic/posts.js';

import { closeReplyNoDBRefresh } from './include/closeReply.js'
import Post from './Post.jsx';
import PostEditor from './PostEditor.jsx';
import Replies from './Replies.jsx';
import DatabaseContext from './DatabaseContext.jsx'
import LanguageContext from './LanguageContext.jsx'
import SystemNotificationArea from './SystemNotificationArea.jsx';

import { useContext, useRef, useState } from 'react';
import ReactTimeAgo from 'react-time-ago';

export default function PostAndYourNewReplies({post, prune, onBoost, onReact}) {
  const languageContext = useContext(LanguageContext);
  const db = useContext(DatabaseContext);

  const postRef = useRef(null);

  const postsDB = new PostsDB(db);

  const [replies, setReplies] = useState([]);

  const isBoostPost = post.boostedPosts && post.boostedPosts.length > 0 && post.text === null;
  const [numReplies, setNumReplies] = useState(postsDB.getNumRepliesTo(isBoostPost? post.boostedPosts[0].uri : post.uri));

  const [composingReply, setComposingReply] = useState(false);

  return (
    <>
      <Post ref={postRef} post={post} showReplyBanner={true} composingReply={composingReply} setComposingReply={setComposingReply} numReplies={numReplies} setNumReplies={setNumReplies} onBoost={onBoost} onReact={onReact}>
        {composingReply &&
          <div className="composing-reply">
            <PostEditor replyingTo={post.uri} conversationId={post.conversationId ?? post.uri} onSave={post => { closeReplyNoDBRefresh({post, setComposingReply, numReplies, setNumReplies, postsDB, replies, setReplies}); postRef.current.focusReplyButton(); } } onCancel={() => { postRef.current.focusReplyButton(); setComposingReply(false); }} />
          </div>
        }

        {numReplies > 0 &&
          <Replies postRepliedTo={post} replies={replies} />
        }
      </Post>
    </>
  );
}
