import PostsDB from './logic/Posts.js';

import Post from './Post.jsx';
import Replies from './Replies.jsx';
import { Link, useLoaderData } from "react-router-dom";

export function getPostLoader(db) {
  return ({params}) => {
    const postsDB = new PostsDB(db);

    const post = postsDB.get(params.postUri);

    return { post };
  };
}

export function PostSingle() {
  const post = useLoaderData().post;

  const dateFormat = new Intl.DateTimeFormat(navigator.language, {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short'
  });

  return (
    <>
    <Post post={post} dateFormat={dateFormat} />
    <Replies postRepliedTo={post} />
    </>
  );
}
