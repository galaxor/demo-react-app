import PostsDB from './logic/Posts.js';

import DatabaseContext from './DatabaseContext.jsx';
import Post from './Post.jsx';
import { useContext } from 'react';
import { Link, useLoaderData } from "react-router-dom";

export function getPostLoader(db) {
  return ({params}) => {
    const postsDB = new PostsDB(db);

    const post = postsDB.get(params.postUri);

    return { post };
  };
}

export function PostSingle() {
  const db = useContext(DatabaseContext);

  const post = useLoaderData().post;

  const dateFormat = new Intl.DateTimeFormat(navigator.language, {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short'
  });

  return (
    <Post post={post} dateFormat={dateFormat} />
  );
}
