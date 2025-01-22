import { useContext } from 'react'

import { computeThread, createStylesheetsForHover, flattenThread, getRepliesTo } from './include/thread-gymnastics.js'
import { PostsDB } from './logic/posts.js';
import DatabaseContext from './DatabaseContext.jsx'
import ThreadedPost from './components/ThreadedPost.jsx'


export default function Test({db}) {
  const postsDB = new PostsDB(db);
  
  const originatingPost = postsDB.get('@testuser@local/3c5ae400-7bbe-4d73-b690-5267b3fa3826');
  getRepliesTo(originatingPost, postsDB);

  const threadOrder = flattenThread(originatingPost);
  computeThread(threadOrder);

  console.log(threadOrder);

/*
  return (
        <ThreadedPost key={threadOrder[0].post.uri} 
          post={threadOrder[0].post} 
          threadHandles={threadOrder[0].threadHandles}
        />
  );
*/

  return (<>
    {threadOrder.map(threadedPost => {
      return (<div className="flex">
        {threadedPost.threadHandles.map(threadHandle => {
          return <span>{threadHandle.glyph}({threadOrder[threadHandle.pointsTo].post.text}) {" "}</span>;
        })}
        <span>:: {threadedPost.post.text}</span>
      </div>
      );
    })}
  </>);
}
