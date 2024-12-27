import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { closeReply } from './closeReply.js'
import Corner from './corner-svg.jsx'
import DatabaseContext from './DatabaseContext.jsx'
import hashSum from 'hash-sum'
import Post from './Post.jsx';
import PostEditor from './PostEditor.jsx';
import { PostsDB } from './logic/posts.js';

export default function ThreadedPost({post, inReplyTo, className, scrollRef}) {
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

  const postRef = useRef(null);
  const scrollHereRef = scrollRef ?? useRef(null);

  const [composingReply, setComposingReply] = useState(false);

  const [numReplies, setNumReplies] = useState(postsDB.getNumRepliesTo(post.uri));
  

  return (
      <div className={"threaded-post flex "+(className ?? "")+" threaded-post-"+hashSum(post.uri).toString(16)} key={post.uri}>
        {inReplyTo.length > 0? 
          <ul>
            {inReplyTo.map(inReplyTo  => {
              const postRepliedTo = inReplyTo.post;
              const drawThreadLine = inReplyTo.drawThreadLine;
              const hasBranch = inReplyTo.hasBranch;
              const hasReplies = inReplyTo.hasReplies;
              const collapsed = inReplyTo.collapsed;

              return (
              <li key={postRepliedTo.uri} className={drawThreadLine + (hasBranch? " has-branch " : " ") + (hasReplies? " has-replies " : " ") + (collapsed? " collapsed " : " ") }>
                <a href={"#p"+hashSum(postRepliedTo.uri).toString(16)} className="thread-handle"><Corner />
                  <span className="thread-handle-text">Replying to {postRepliedTo.authorPerson.displayName}: {" "}
                    {postRepliedTo.text.substring(0, 30)}{postRepliedTo.text.length > 30? "..." : ""}</span>
                </a>
              </li>
              );
            })}
          </ul>
          : ""
        }

        <div className="post-and-composing-reply w-full">
          <Post id={"p"+(hashSum(post.uri).toString(16))} ref={postRef} post={post} scrollHereRef={scrollHereRef}
            composingReply={composingReply} setComposingReply={setComposingReply} 
            numReplies={numReplies} setNumReplies={setNumReplies}>

            {composingReply?
              <div className="composing-reply">
                <PostEditor replyingTo={post.uri} conversationId={post.conversationId ?? post.uri} onSave={post => { closeReply({post, setComposingReply, numReplies, setNumReplies, postsDB, replies, setReplies}); postRef.current.focusReplyButton(); } } onCancel={() => { postRef.current.focusReplyButton(); setComposingReply(false); } } />
              </div>
              : ""
            }
          </Post>
        </div>
      </div>
  );
}
