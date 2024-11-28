import { PostsDB } from './logic/posts.js';

import { closeReplyNoDBRefresh } from './closeReply.js'
import Post from './Post.jsx';
import PostEditor from './PostEditor.jsx';
import Replies from './Replies.jsx';
import DatabaseContext from './DatabaseContext.jsx'
import LanguageContext from './LanguageContext.jsx'
import SystemNotificationArea from './SystemNotificationArea.jsx';

import { useContext, useState } from 'react';
import ReactTimeAgo from 'react-time-ago';

export default function PostAndReplies({post, prune}) {
  const languageContext = useContext(LanguageContext);
  const db = useContext(DatabaseContext);

  const postsDB = new PostsDB(db);

  const [replies, setReplies] = useState([]);

  const isBoostPost = post.boostedPosts && post.boostedPosts.length > 0 && post.text === null;
  const [numReplies, setNumReplies] = useState(postsDB.getNumRepliesTo(isBoostPost? post.boostedPosts[0].uri : post.uri));

  const [composingReply, setComposingReply] = useState(false);

  return (
    <>
      <Post post={post} composingReply={composingReply} setComposingReply={setComposingReply} numReplies={numReplies} setNumReplies={setNumReplies}>
        {composingReply &&
          <div className="composing-reply">
            <PostEditor replyingTo={post.uri} onSave={post => closeReplyNoDBRefresh({post, setComposingReply, numReplies, setNumReplies, postsDB, replies, setReplies}) } />
          </div>
        }

        {numReplies > 0 &&
          <Replies postRepliedTo={post} replies={replies} />
        }
      </Post>
    </>
  );
}
