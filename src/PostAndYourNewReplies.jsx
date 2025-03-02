import { PostsDB } from './logic/posts.js';

import { closeReplyNoDBRefresh } from './include/closeReply.js'
import Post from './Post.jsx';
import PostEditor from './PostEditor.jsx';
import Replies from './Replies.jsx';
import ThreadedPost from './components/ThreadedPost.jsx'
import { createStylesheetsForHover, threadGymnastics, onDeleteFn, setRepliesFn, findPost } from './include/thread-gymnastics.js'

import DatabaseContext from './DatabaseContext.jsx'
import LanguageContext from './LanguageContext.jsx'

import hashSum from 'hash-sum'
import { useContext, useRef, useState } from 'react';
import ReactTimeAgo from 'react-time-ago';

export default function PostAndYourNewReplies({post, prune, onBoost, onReact, onDelete, isMainPost}) {
  const languageContext = useContext(LanguageContext);
  const db = useContext(DatabaseContext);

  const postRef = useRef(null);

  const postsDB = new PostsDB(db);

  const [threadOrder, setThreadOrder] = useState(threadGymnastics(post));

  const [replies, setReplies] = useState([]);

  const isBoostPost = post.boostedPosts && post.boostedPosts.length > 0 && post.text === null;

  const passThreadHandles = (typeof threadOrder[0] === "undefined")? [] : threadOrder[0].threadHandles;

  return (
    <>
      <article className={`post-and-your-new-replies post-and-your-new-replies-${hashSum(post.uri).toString(16)}`}>
        <style type="text/css">{createStylesheetsForHover(threadOrder, '.post-and-your-new-replies-'+hashSum(post.uri).toString(16))}</style>
        <ThreadedPost key={post.uri}
          post={post} 
          threadHandles={passThreadHandles}
          onReact={onReact}
          onBoost={onBoost}
          onDelete={onDeleteFn(post, post, onDelete)}
          setReplies={setRepliesFn(post, post, originatingPost => setThreadOrder(threadGymnastics(originatingPost)))}
          isMainPost={isMainPost}
        />
        {threadOrder.slice(1).map(({threadHandles, post: replyPost}) => {
          return (
            <ThreadedPost key={replyPost.uri}
              className="reply"
              post={replyPost} 
              threadHandles={threadHandles}
              onDelete={onDeleteFn(replyPost, post, () => {})}
              setReplies={setRepliesFn(replyPost, post, originatingPost => setThreadOrder(threadGymnastics(originatingPost)))}
            />
          );
        })}
      </article>
    </>
  );
}
