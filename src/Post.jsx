import { useContext } from 'react'
import ReactTimeAgo from 'react-time-ago'
import { Link } from 'react-router-dom';

import LanguageContext from './LanguageContext.jsx'
import PersonInline from './PersonInline.jsx'

export default function Post({post, children}) {
  const languageContext = useContext(LanguageContext);

  const dateFormat = new Intl.DateTimeFormat(navigator.language, {
    weekday: 'long', year: 'numeric', month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short'
  });

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

      {children}
    </article>
  );
}
