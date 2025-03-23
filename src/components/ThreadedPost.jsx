import hashSum from 'hash-sum'
import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { closeReplyNoDBRefresh } from '../include/closeReply.js'
import Corner from './corner-svg.jsx'
import DatabaseContext from '../DatabaseContext.jsx'
import Post from '../Post.jsx';
import PostEditor from '../PostEditor.jsx';
import { PostsDB } from '../logic/posts.js';

export default function ThreadedPost({post, threadHandles, className, scrollRef, setReplies, onReact, onBoost, setScrollToPost, onDelete, isMainPost}) {
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

  const postRef = useRef(null);
  const scrollHereRef = scrollRef ?? useRef(null);

  const [composingReply, setComposingReply] = useState(false);
  const [editingPost, setEditingPost] = useState(false);

  const [numReplies, setNumReplies] = useState(0);
  
  useEffect(() => {
    (async () => {
      setNumReplies(await postsDB.getNumRepliesTo(post.uri));
    })();
  }, []);

  
  return (
      <div id={"threaded-post-"+hashSum(post.uri).toString(16)} className={"threaded-post flex "+(className ?? "")+" threaded-post-"+hashSum(post.uri).toString(16)} key={post.uri}>
        {threadHandles.length > 0? 
          <ul>
            {threadHandles.map(threadHandle  => {
              const postId = `p${hashSum(threadHandle.pointsToPost.uri).toString(16)}`
              const onHover = onThreadHandleHoverFn(postId);
              const onUnhover = onThreadHandleUnhoverFn(postId);
              return (
              <li key={threadHandle.pointsToPost.uri} className={threadHandle.glyph}>
                <a href={`#${postId}`} className="thread-handle"
                  onPointerEnter={onHover}
                  onFocus={onHover}
                  onPointerLeave={onUnhover}
                  onBlur={onUnhover}
                ><Corner /></a>
              </li>
              );
            })}
          </ul>
          : ""
        }

        <div className="post-and-composing-reply w-full">
          <Post id={"p"+(hashSum(post.uri).toString(16))} ref={postRef} post={post} scrollHereRef={scrollHereRef}
            showReplyBanner={true}
            composingReply={composingReply} setComposingReply={setComposingReply} 
            editingPost={editingPost} setEditingPost={setEditingPost}
            numReplies={numReplies} setNumReplies={setNumReplies}
            onReact={onReact}
            onBoost={onBoost}
            onDelete={onDelete}
            isMainPost={isMainPost}
          >

            {composingReply?
              <div className="composing-reply">
                <PostEditor replyingTo={post.uri} conversationId={post.conversationId ?? post.uri} 
                  onSave={newPost => { 
                    closeReplyNoDBRefresh({post: newPost, setComposingReply, numReplies, setNumReplies, postsDB, replies: post.replies, setReplies});
                    // postRef.current.focusReplyButton(); 
                    if (typeof setScrollToPost !== "undefined") {
                      setScrollToPost(hashSum(newPost.uri).toString(16));
                    }
                  }} 
                  onCancel={() => { postRef.current.focusReplyButton(); setComposingReply(false); } } />
              </div>
              : ""
            }
          </Post>
        </div>
      </div>
  );
}


function onThreadHandleHoverFn(postId) {
  return (event) => {
    // Highlight all the thread handles that point to the same post.
    for (const threadHandle of document.querySelectorAll(`.thread-handle[href="#${postId}"]`)) {
      threadHandle.classList.add('thread-handle-highlight');
    }

    // Highlight the actual post (What if it's on the page more than once??)
    // If it's on the page more than once, then the id is repeated, which it
    // shouldn't be.  It might end up on the page more than once if we're
    // looking at a feed that contains it as a boosted post and also as itself.
    // XXX We should figure out a way to give it a different id if that
    // situation comes up.
    const post = document.getElementById(postId);
    post.classList.add('thread-handle-highlight');
  };
}

function onThreadHandleUnhoverFn(postId) {
  return (event) => {
    // Unhighlight all the thread handles that point to the same post.
    for (const threadHandle of document.querySelectorAll(`.thread-handle[href="#${postId}"]`)) {
      threadHandle.classList.remove('thread-handle-highlight');
    }

    // Unhighlight the actual post (What if it's on the page more than once??)
    // If it's on the page more than once, then the id is repeated, which it
    // shouldn't be.  It might end up on the page more than once if we're
    // looking at a feed that contains it as a boosted post and also as itself.
    // XXX We should figure out a way to give it a different id if that
    // situation comes up.
    const post = document.getElementById(postId);
    post.classList.remove('thread-handle-highlight');
  };
}
