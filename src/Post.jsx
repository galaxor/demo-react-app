import { useContext } from 'react'
import ReactTimeAgo from 'react-time-ago'
import { Link } from 'react-router-dom'
import Markdown from 'react-markdown'

import Boosts from './Boosts.jsx'
import LanguageContext from './LanguageContext.jsx'
import NumReplies from './NumReplies.jsx'
import PersonInline from './PersonInline.jsx'
import Reactions from './Reactions.jsx'
import UserContext from './UserContext.jsx'

import './static/Post.css'

export default function Post({post, replies, children}) {
  const languageContext = useContext(LanguageContext);

  const { user } = useContext(UserContext);

  const dateFormat = new Intl.DateTimeFormat(navigator.language, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short'
  });

  const htmlId = encodeURIComponent(post.uri)+'-stats';

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

      {(post.type ?? "text") === "text" && <div className="post-text e-content" lang={post.language}>{post.text}</div>}
      {post.type === "markdown" && <div className="post-text e-content" lang={post.language}><Markdown>{post.text}</Markdown></div>}

      {post.boostedPosts && post.boostedPosts.length > 0 &&
        <div className="quote-boosted-posts">
          {post.boostedPosts.map(boostedPost => 
            <Post key={boostedPost.uri} post={boostedPost} />
          )}
        </div>
      }

      <aside id={htmlId} className="post-stats" aria-labelledby={htmlId+'-header'}>
        <span className="post-stats-header" id={htmlId+'-header'}>Stats {user && <> and Actions </>}</span>
        
        <ul aria-labelledby={htmlId+'-header'}>
          <li><NumReplies post={post} replies={replies} /></li>
          <li><Boosts post={post} /></li>
          <li><Reactions post={post} /></li>
        </ul>
      </aside>

      {children}
    </article>
  );
}
