import { PostsDB } from './logic/posts.js';

import { closeReply } from './closeReply.js'
import Post from './Post.jsx';
import PostEditor from './PostEditor.jsx';
import Replies from './Replies.jsx';
import DatabaseContext from './DatabaseContext.jsx'
import LanguageContext from './LanguageContext.jsx'
import SystemNotificationArea from './SystemNotificationArea.jsx';

import { useContext, useEffect, useRef, useState } from 'react';
import ReactTimeAgo from 'react-time-ago';

export default function PostAndReplies({post, prune}) {
  const languageContext = useContext(LanguageContext);
  const db = useContext(DatabaseContext);

  const postRef = useRef(null);

  const postsDB = new PostsDB(db);

  const [replies, setReplies] = useState(postsDB.getRepliesTo(post.uri));

  const isBoostPost = post.boostedPosts && post.boostedPosts.length > 0 && post.text === null;
  const [numReplies, setNumReplies] = useState(postsDB.getNumRepliesTo(isBoostPost? post.boostedPosts[0].uri : post.uri));

  const [composingReply, setComposingReply] = useState(false);

  if (post.uri === prune) { return ""; }

  function clickPost(e) {
    // A little old-school javascript to pass the clicks to the link that goes to
    // the post's PostSingle page.
    if (e.target.nodeName === "A") {
      return false;
    } else {
      var node = e.target;
      for ( ; node.nodeName !== "ARTICLE"; node = node.parentElement) { }
      node.querySelector('a.post-time').click();
    }
  }

  // Make it so when you click a post, you go to its PostSingle page.
  useEffect(() => {
    const postDiv = postRef.current.getPostDiv();

    const clickablePosts = postDiv.querySelectorAll('article.post > div.post')

    clickablePosts.forEach(node => {
      node.addEventListener('click', clickPost);
    });

    return(() => {
      clickablePosts.forEach(node => {
        node.removeEventListener('click', clickPost);
      });
    });
  }, [postRef]);

  return (
    <>
      <div className="post-and-replies">
        <Post ref={postRef} post={post} composingReply={composingReply} setComposingReply={setComposingReply} numReplies={numReplies} setNumReplies={setNumReplies}>
          {composingReply &&
            <div className="composing-reply">
              <PostEditor replyingTo={post.uri} conversationId={post.conversationId ?? post.uri} onSave={post => { closeReply({post, setComposingReply, numReplies, setNumReplies, postsDB, replies, setReplies}); postRef.current.focusReplyLink(); } } onCancel={() => setComposingReply(false)} />
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
