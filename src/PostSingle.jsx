import { PostsDB } from './logic/posts.js';

import Post from './Post.jsx';
import Replies from './Replies.jsx';
import DatabaseContext from './DatabaseContext.jsx'
import LanguageContext from './LanguageContext.jsx'
import SystemNotificationArea from './SystemNotificationArea.jsx';

import { useContext } from 'react';
import { useLoaderData } from "react-router-dom";
import ReactTimeAgo from 'react-time-ago';

export default function PostSingle() {
  const post = useLoaderData().post;
  const languageContext = useContext(LanguageContext);
  const db = useContext(DatabaseContext);

  const postsDB = new PostsDB(db);

  const originatingPost = (post.conversationId === post.uri || post.conversationId === null)?
                          null :
                          postsDB.get(post.conversationId)
                          ;

  const replies = postsDB.getRepliesTo(post.uri);

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

      <Post post={post} replies={replies}>
        {replies.length > 0 &&
          <section className="replies-section" aria-labelledby="replies-section-header">
            <h2 id="replies-section-header">Replies</h2>
            <Replies postRepliedTo={post} replies={replies} />
          </section>
        }

        {post.conversationId &&
          <section className="thread-context" aria-labelledby="thread-context-header">
            <h2 id="thread-context-header">Thread Context</h2>
            <Post post={originatingPost}>
              <Replies postRepliedTo={originatingPost} prune={post.uri} />
            </Post>
          </section>
        }
      </Post>
    </main>
    </>
  );
}
