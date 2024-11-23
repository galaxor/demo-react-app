import Posts from './logic/Posts.js';

import Post from './Post.jsx';
import { Link, useLoaderData } from "react-router-dom";

export function getPostLoader(db) {
  return ({params}) => {
    const postsDB = new Posts(db);

    const post = postsDB.get(params.postURI);

    return { post };
  };
}

export function PostSingle() {
  const post = useLoaderData().post;

  return "I'm ready to boogie";
}
