import { forwardRef, useContext, useImperativeHandle, useRef, useState } from 'react'
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

const Post = forwardRef(function Post(props, ref) {
  const {post, composingReply, setComposingReply, numReplies, setNumReplies, children, showStats, showReplyBanner} = props;

  // showStats defaults to true.
  const showStatsForReal = (typeof showStats === "undefined")? true : showStats;

  const languageContext = useContext(LanguageContext);
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

  const replyLinkRef = useRef(null);

  if (typeof ref.current !== "undefined") {
    useImperativeHandle(ref, () => {
      return {
        focusReplyLink() {
          replyLinkRef.current.focus();
        },
      };
    });
  }

  const { user } = useContext(UserContext);

  const isBoostPost = post.boostedPosts && post.boostedPosts.length > 0 && post.text === null;

  // If we're drawing a normal post or a quote-boost, we want the replies to this post.
  // If we're drawing a boost-post, we want the replies to the boosted post instead.

  // XXX We're assuming that this post only boosted one post.  We'll enforce
  // that for now, but one day, we'd like to expand that.  In that case, we'll
  // need some way of knowing *which* post is being boosted here.

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
            <Post key={boostedPost.uri} post={boostedPost} composingReply={composingReply} setComposingReply={setComposingReply} numReplies={numReplies} setNumReplies={setNumReplies} />
          )}
        </div>
        
      </article>
    </> );
  }

  const replyingToPost = showReplyBanner && post.inReplyTo? postsDB.get(post.inReplyTo) : null;
  console.log(replyingToPost);

  return (<>
    <article className="post h-entry">
      {replyingToPost && 
        <div className="boost-info">
        💬 Replying to post by <PersonInline person={replyingToPost.authorPerson} />, 
          <Link to={"/post/"+encodeURIComponent(replyingToPost.uri)}>
          posted {" "}
          <time dateTime={replyingToPost.createdAt}>
            {dateFormat.format(new Date(replyingToPost.createdAt))} {" "}
            (<ReactTimeAgo date={new Date(replyingToPost.createdAt)} locale={languageContext} />)
          </time>
          </Link>
        </div>
      }

      <div className="post">
        <span className="post-date">
          Posted {" "}
          <Link className="post-time dt-published" to={'/post/' + encodeURIComponent(post.uri)}>
              <span className="dt-published published-date">
                <time dateTime={post.createdAt}>{dateFormat.format(new Date(post.createdAt))}</time> {" "}
                (<ReactTimeAgo date={new Date(post.createdAt)} locale={languageContext} />)
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
              <Post showStats={false} key={boostedPost.uri} post={boostedPost}  />
            )}
          </blockquote>
        }

        {showStatsForReal && 
          <aside id={htmlId} className="post-stats" aria-labelledby={htmlId+'-header'}>
            <span className="post-stats-header" id={htmlId+'-header'}>Stats {user && <> and Actions </>}</span>
            
            <ul aria-labelledby={htmlId+'-header'}>
              <li><NumReplies ref={replyLinkRef} post={post} setComposingReply={setComposingReply} numReplies={numReplies} setNumReplies={setNumReplies}  /></li>
              <li><Boosts post={post} /></li>
              <li><Reactions post={post} /></li>
            </ul>
          </aside>
        }
      </div>

      {children}
    </article>

    </>
  );
});

export default Post;
