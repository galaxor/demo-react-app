import PostsDB from './logic/Posts.js';
import PeopleDB from './logic/people.js';

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

  const peopleDB = new PeopleDB(db);

  const post = useLoaderData().post;
  post.authorPerson = peopleDB.get(post.author);

  const dateFormat = new Intl.DateTimeFormat(navigator.language, {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short'
  });

  return (
    <Post post={post} dateFormat={dateFormat} />
  );
}
