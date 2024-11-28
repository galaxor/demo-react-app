import { useContext, useState } from 'react'
import ReactTimeAgo from 'react-time-ago'
import { Link } from 'react-router-dom'
import Markdown from 'react-markdown'

import Boosts from './Boosts.jsx'
import DatabaseContext from './DatabaseContext'
import LanguageContext from './LanguageContext.jsx'
import NumReplies from './NumReplies.jsx'
import PersonInline from './PersonInline.jsx'
import PostEditor from './PostEditor.jsx'
import { PostsDB } from './logic/posts.js'
import Reactions from './Reactions.jsx'
import UserContext from './UserContext.jsx'

import './static/Post.css'

export default function Post({post, children, knownReplies, setKnownReplies}) {
  const languageContext = useContext(LanguageContext);
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

  const { user } = useContext(UserContext);

  const isBoostPost = post.boostedPosts && post.boostedPosts.length > 0 && post.text === null;

  // If we're drawing a normal post or a quote-boost, we want the replies to this post.
  // If we're drawing a boost-post, we want the replies to the boosted post instead.
  // Also, we may have been passed a precomputed set of replies.  If so, we
  // want to use that instead of recomputing them here.

  const [replies, setReplies] = useState(knownReplies ??
              postsDB.getRepliesTo(isBoostPost? post.boostedPosts[0].uri : post.uri));
  // XXX We're assuming that this post only boosted one post.  We'll enforce
  // that for now, but one day, we'd like to expand that.  In that case, we'll
  // need some way of knowing *which* post is being boosted here.

  const [numReplies, setNumReplies] = useState(replies.length);
  const [composingReply, setComposingReply] = useState(false);

  const dateFormat = new Intl.DateTimeFormat(navigator.language, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short'
  });

  const htmlId = encodeURIComponent(post.uri)+'-stats';

  // If it's a boost, we need to draw it as a boost.
  if (isBoostPost) {
    return ( <>
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
            <Post key={boostedPost.uri} post={boostedPost} knownReplies={replies} setKnownReplies={setReplies} />
          )}
        </div>
        
      </article>
    </> );
  }

  return (<>
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
        <blockquote className="quote-boosted-posts">
          {post.boostedPosts.map(boostedPost => 
            <Post key={boostedPost.uri} post={boostedPost} />
          )}
        </blockquote>
      }

      <aside id={htmlId} className="post-stats" aria-labelledby={htmlId+'-header'}>
        <span className="post-stats-header" id={htmlId+'-header'}>Stats {user && <> and Actions </>}</span>
        
        <ul aria-labelledby={htmlId+'-header'}>
          <li><NumReplies post={post} knownReplies={replies} setComposingReply={setComposingReply} numReplies={numReplies} setNumReplies={setNumReplies}  /></li>
          <li><Boosts post={post} /></li>
          <li><Reactions post={post} /></li>
        </ul>
      </aside>

      {composingReply &&
        <div className="composing-reply">
          <PostEditor replyingTo={post.uri} onSave={post => closeReply({post, setComposingReply, numReplies, setNumReplies, knownReplies, setKnownReplies, postsDB}) } />
        </div>
      }

      {children}
    </article>

    </>
  );
}

function closeReply({post, setComposingReply, numReplies, setNumReplies, knownReplies, setKnownReplies, postsDB}) {
  setNumReplies(numReplies+1);
  setComposingReply(false);

  console.log(post.inReplyTo);

  const updatedReplies = postsDB.getRepliesTo(post.inReplyTo);

  setKnownReplies(updatedReplies);
}
