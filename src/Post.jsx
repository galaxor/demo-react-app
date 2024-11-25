import { useContext } from 'react'
import ReactTimeAgo from 'react-time-ago'
import { Link } from 'react-router-dom';

import LanguageContext from './LanguageContext.jsx'
import PersonInline from './PersonInline.jsx'
import Reactions from './Reactions.jsx'

import './static/Post.css'

export default function Post({post, children}) {
  const languageContext = useContext(LanguageContext);

  const dateFormat = new Intl.DateTimeFormat(navigator.language, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short'
  });

  // If it's a boost, we need to draw it as a boost.
  if (post.boostedPosts && post.boostedPosts.length > 0 && post.text === null) {
    return (
      <article className="post h-entry">
        <div className="boost-info">
        ♻ <PersonInline person={post.authorPerson} /> boosted this at {" "}
          <time dateTime={post.updatedAt}>
            {dateFormat.format(new Date(post.updatedAt))}
            (<ReactTimeAgo date={new Date(post.updatedAt)} locale={languageContext} />)
          </time>
        </div>

        <div className="boosted-posts">
          {post.boostedPosts.map(boostedPost => 
            <Post key={boostedPost.uri} post={boostedPost} />
          )}
        </div>
        
      </article>
    );
  }

  return (
    <article className="post h-entry">
      <span className="post-date">
        Posted {" "}
        <Link className="post-time dt-published" to={'/post/' + encodeURIComponent(post.uri)}>
            <span className="dt-published published-date">
              <time dateTime={post.createdAt}>{dateFormat.format(new Date(post.createdAt))}</time> {" "}
              (<ReactTimeAgo date={new Date(post.updatedAt)} locale={languageContext} />)
            </span>

            {post.updatedAt !== post.createdAt ?
              <span className="dt-updated updated-date">
                , updated {" "}
                <time dateTime={post.updatedAt}>{dateFormat.format(new Date(post.updatedAt))}</time> {" "}
                (<ReactTimeAgo date={new Date(post.updatedAt)} locale={languageContext} />)
              </span>
              :
              ''
            }
        </Link>
      </span>
          
      <span className="post-author">
        By {" "}
        <PersonInline person={post.authorPerson} />
      </span>

      <div className="post-text e-content" lang={post.language}>{post.text}</div>

      {post.boostedPosts && post.boostedPosts.length > 0 &&
        <div className="quote-boosted-posts">
          {post.boostedPosts.map(boostedPost => 
            <Post key={boostedPost.uri} post={boostedPost} />
          )}
        </div>
      }

      <Reactions post={post} />

      {children}
    </article>
  );
}
