import { PostsDB } from './logic/posts.js';

import { closeReply } from './closeReply.js'
import ReplyLevel from './ReplyLevel.jsx'
import Post from './Post.jsx';
import PostAndReplies from './PostAndReplies.jsx';
import PostEditor from './PostEditor.jsx';
import Replies from './Replies.jsx';
import DatabaseContext from './DatabaseContext.jsx'
import LanguageContext from './LanguageContext.jsx'
import SystemNotificationArea from './SystemNotificationArea.jsx';

import { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLoaderData } from "react-router-dom";
import ReactTimeAgo from 'react-time-ago';

export default function PostSingle() {
  const post = useLoaderData().post;
  const languageContext = useContext(LanguageContext);
  const db = useContext(DatabaseContext);

  const postsDB = useMemo(() => new PostsDB(db), [db]);

  const postRef = useRef(null);

  const [replies, setReplies] = useState(postsDB.getRepliesTo(post.uri));

  const isBoostPost = post.boostedPosts && post.boostedPosts.length > 0 && post.text === null;
  const [numReplies, setNumReplies] = useState(postsDB.getNumRepliesTo(isBoostPost? post.boostedPosts[0].uri : post.uri));

  const originatingPost = (post.conversationId === post.uri || post.conversationId === null)?
                          null :
                          postsDB.get(post.conversationId)
                          ;

  const [composingReply, setComposingReply] = useState(false);

  // Scroll the post into view when it first becomes visible.
  const scrollHereRef = useCallback(node => {
    if (node) { node.scrollIntoView(); }

    return {current: node};
  }, [replies]);


  // Sometimes when I click to a different post, it would keep the replies the
  // same so the thread looked all wrong.
  // This fixes that.
  useEffect(() => {
    setReplies(postsDB.getRepliesTo(post.uri));
    const isBoostPost = post.boostedPosts && post.boostedPosts.length > 0 && post.text === null;
    setNumReplies(postsDB.getNumRepliesTo(isBoostPost? post.boostedPosts[0].uri : post.uri));
    setComposingReply(false);
  }, [post, postsDB]);

  return (
    <>
    <main className="post-single">
      <h1>Post by <bdi>{post.authorPerson.displayName}</bdi>,{" "}
        <time dateTime={post.createdAt}>
          <ReactTimeAgo date={new Date(post.createdAt)} locale={languageContext} />
        </time>
        {post.updatedAt !== post.createdAt &&
          <>
          , updated {" "}
            <time dateTime={post.updatedAt}>
              <ReactTimeAgo date={new Date(post.updatedAt)} locale={languageContext} />
            </time>
          </>
        }
      </h1>

      <SystemNotificationArea />

      <div ref={scrollHereRef} className="scroll-into-view"></div>
          <Post ref={postRef} showReplyLevel className="post-single" post={post} composingReply={composingReply} setComposingReply={setComposingReply} numReplies={numReplies} setNumReplies={setNumReplies}>
            {composingReply &&
              <div className="composing-reply">
                <PostEditor replyingTo={post.uri} conversationId={post.conversationId ?? post.uri} onSave={post => { closeReply({post, setComposingReply, numReplies, setNumReplies, postsDB, replies, setReplies}); postRef.current.focusReplyButton(); } } onCancel={() => { postRef.current.focusReplyButton(); setComposingReply(false); }} />
              </div>
            }

        {numReplies > 0 &&
          <section className="replies-section" aria-labelledby="replies-section-header">
            <h2 id="replies-section-header" className="visually-hidden">Replies</h2>
            <ReplyLevel post={post}>
              <Replies postRepliedTo={post} replies={replies} setReplies={setReplies} />
            </ReplyLevel>
          </section>
        }

        {post.conversationId &&
          <section className="thread-context" aria-labelledby="thread-context-header">
            <h2 id="thread-context-header" className="visually-hidden">Thread Context</h2>
            <PostAndReplies post={originatingPost} prune={post.uri} />
          </section>
        }
      </Post>
    </main>
    </>
  );
}
