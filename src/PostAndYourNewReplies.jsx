import { PostsDB } from './logic/posts.js';

import { closeReplyNoDBRefresh } from './include/closeReply.js'
import Post from './Post.jsx';
import PostEditor from './PostEditor.jsx';
import Replies from './Replies.jsx';
import ThreadedPost from './components/ThreadedPost.jsx'
import { createStylesheetsForHover, threadGymnastics, onDeleteFn, setRepliesFn, findPost } from './include/thread-gymnastics.js'

import DatabaseContext from './DatabaseContext.jsx'
import LanguageContext from './LanguageContext.jsx'

import { useContext, useRef, useState } from 'react';
import ReactTimeAgo from 'react-time-ago';

export default function PostAndYourNewReplies({post, prune, onBoost, onReact}) {
  const languageContext = useContext(LanguageContext);
  const db = useContext(DatabaseContext);

  const postRef = useRef(null);

  const postsDB = new PostsDB(db);

  const [threadOrder, setThreadOrder] = useState(null);

  const [replies, setReplies] = useState([]);

  const isBoostPost = post.boostedPosts && post.boostedPosts.length > 0 && post.text === null;
  const [numReplies, setNumReplies] = useState(postsDB.getNumRepliesTo(isBoostPost? post.boostedPosts[0].uri : post.uri));

  if (threadOrder === null) {
    threadGymnastics(post, () => {}, setThreadOrder);
    return "";
  }

  return (
    <>
      <div className="post-and-your-new-replies">
      {threadOrder.map(({threadHandles, post}) => {
        return (
          <ThreadedPost key={post.uri}
            post={post} 
            threadHandles={threadHandles}
            onDelete={onDeleteFn(post, post, threadGymnastics, () => {}, setThreadOrder)}
            setReplies={setRepliesFn(post, post, threadGymnastics, () => {}, setThreadOrder)}
          />
        );
      })}
      </div>
    </>
  );
}
