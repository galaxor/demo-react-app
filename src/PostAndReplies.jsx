import { PostsDB } from './logic/posts.js';

import { clickPost } from './clickPost.js'
import { closeReply } from './closeReply.js'
import Post from './Post.jsx';
import PostEditor from './PostEditor.jsx';
import Replies from './Replies.jsx';
import DatabaseContext from './DatabaseContext.jsx'
import LanguageContext from './LanguageContext.jsx'
import SystemNotificationArea from './SystemNotificationArea.jsx';

import { useContext, useEffect, useRef, useState } from 'react';
import ReactTimeAgo from 'react-time-ago';

export default function PostAndReplies({post, id, prune}) {

  const languageContext = useContext(LanguageContext);
  const db = useContext(DatabaseContext);

  const postRef = useRef(null);

  const postsDB = new PostsDB(db);

  const [replies, setReplies] = useState(postsDB.getRepliesTo(post.uri));

  const isBoostPost = post.boostedPosts && post.boostedPosts.length > 0 && post.text === null;
  const [numReplies, setNumReplies] = useState(postsDB.getNumRepliesTo(isBoostPost? post.boostedPosts[0].uri : post.uri));

  const [composingReply, setComposingReply] = useState(false);

  if (post.uri === prune) { return ""; }

  // Make it so when you click a post, you go to its PostSingle page.
  useEffect(() => {
    const postDiv = postRef.current.getPostDiv();

    postDiv.addEventListener('click', clickPost);

    return(() => {
      postDiv.removeEventListener('click', clickPost);
    });
  }, [postRef]);

  return (
    <>
      <div className="post-and-replies">
        <Post id={id} ref={postRef} post={post} composingReply={composingReply} setComposingReply={setComposingReply} numReplies={numReplies} setNumReplies={setNumReplies}>
          {composingReply &&
            <div className="composing-reply">
              <PostEditor replyingTo={post.uri} conversationId={post.conversationId ?? post.uri} onSave={post => { closeReply({post, setComposingReply, numReplies, setNumReplies, postsDB, replies, setReplies}); postRef.current.focusReplyButton(); } } onCancel={() => { postRef.current.focusReplyButton(); setComposingReply(false); } } />
            </div>
          }

          {numReplies > 0 &&
            <Replies postRepliedTo={post} replies={replies} prune={prune} />
          }
        </Post>
      </div>
    </>
  );
}
