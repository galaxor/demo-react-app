import PostsDB from './logic/Posts.js';

import Post from './Post.jsx';
import Replies from './Replies.jsx';
import LanguageContext from './LanguageContext.jsx'

import { useContext } from 'react';
import { Link, useLoaderData } from "react-router-dom";
import ReactTimeAgo from 'react-time-ago';

export function getPostLoader(db) {
  return ({params}) => {
    const postsDB = new PostsDB(db);

    const post = postsDB.get(params.postUri);

    return { post };
  };
}

export function PostSingle() {
  const post = useLoaderData().post;
  const languageContext = useContext(LanguageContext);

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

      <Post post={post}>
        <section className="replies-section">
          <h2>Replies</h2>
          <Replies postRepliedTo={post} />
        </section>
      </Post>
    </main>
    </>
  );
}
