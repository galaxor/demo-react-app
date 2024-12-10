import { Button } from "@nextui-org/button"
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card"
import { forwardRef, useContext, useImperativeHandle, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link, NavLink } from 'react-router-dom'
import { useNavigate } from "react-router"
import ReactTimeAgo from 'react-time-ago'
import TimeAgo from 'javascript-time-ago'
import Markdown from 'react-markdown'

import Boosts from './Boosts.jsx'
import DatabaseContext from './DatabaseContext'
import icons from './icons.js'
import ImageList from './ImageList'
import LanguageContext from './LanguageContext.jsx'
import NumReplies from './NumReplies.jsx'
import PersonInline from './PersonInline.jsx'
import PersonName from './PersonName.jsx'
import PostEditor from './PostEditor.jsx'
import PostDetailsMenu from './PostDetailsMenu.jsx'
import { PostsDB } from './logic/posts.js'
import Reactions from './Reactions.jsx'
import ReplyLevel from './ReplyLevel.jsx'
import UserContext from './UserContext.jsx'

import { fullDateTime, dayFormat, dateFormat, timeFormat } from './timeFormat.js'

import './static/Post.css'

const Post = forwardRef(function Post(props, ref) {
  const {post, composingReply, setComposingReply, numReplies, setNumReplies, children, showStats, showReplyBanner, onBoost, onReact, className, showReplyLevel, scrollHereRef, highlight} = props;

  // showStats defaults to true.
  const showStatsForReal = (typeof showStats === "undefined")? true : showStats;

  const languageContext = useContext(LanguageContext);
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

  const replyButtonRef = useRef(null);

  const postDivRef = useRef(null);
  const childPostRef = useRef(null);

  if (typeof ref.current !== "undefined") {
    useImperativeHandle(ref, () => {
      return {
        focusReplyButton() {
          replyButtonRef.current.focus();
        },

        getPostDiv() {
          if (childPostRef !== null && childPostRef.current !== null) {
            return childPostRef.current.getPostDiv();
          } else {
            return postDivRef.current;
          }
        }
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

  const htmlId = encodeURIComponent(post.uri)+'-stats';

  // If it's a boost, we need to draw it as a boost.
  if (isBoostPost) {
    return ( <>
      <article className="post h-entry">
        <div className="boost-info">
        <FontAwesomeIcon icon="repeat" /> {" "}
          <PersonName link={true} person={post.authorPerson} /> boosted this.
        </div>

        <div className="boosted-posts">
          {post.boostedPosts.map(boostedPost => 
            <Post ref={childPostRef} key={boostedPost.uri} post={boostedPost} composingReply={composingReply} setComposingReply={setComposingReply} numReplies={numReplies} setNumReplies={setNumReplies} scrollHereRef={scrollHereRef} />
          )}
        </div>
        
      </article>
    </> );
  }

  const replyingToPost = showReplyBanner && post.inReplyTo? postsDB.get(post.inReplyTo) : null;

  // We're using ReactTimeAgo in the markup, but plain javascript-time-ago in the aria.
  const timeAgo = new TimeAgo(languageContext);

  const navigate = useNavigate();

  const thePost = (<>
      {replyingToPost && 
        <div className="boost-info">
          <Link to={"/post/"+encodeURIComponent(replyingToPost.uri)}>
            <FontAwesomeIcon icon="comment" /> Replying to <PersonName person={replyingToPost.authorPerson} />
          </Link>
        </div>
      }

      <Card ref={postDivRef} className={"post hover:bg-default-100 "+(highlight? 'ring-2 ring-inset ring-default-500 ' : " ")+className}>
        <CardHeader>
          {typeof scrollHereRef !== "undefined"? <div ref={scrollHereRef} className="scroll-into-view"></div> : ""}
          <span className="post-metadata w-full flex justify-between">
            <span className="post-date order-1 text-right"
              aria-label={post.updatedAt === post.createdAt?
                "Posted "+timeAgo.format(new Date(post.updatedAt))+", "+fullDateTime.format(new Date(post.updatedAt))
                :
                "Updated "+timeAgo.format(new Date(post.updatedAt))+", "+fullDateTime.format(new Date(post.updatedAt))}>
              <Link className="post-time dt-published" to={'/post/' + encodeURIComponent(post.uri)}>
                  <span className="dt-published published-date">
                    <div className={"text-xl time-ago " + (post.updatedAt !== post.createdAt? "time-ago-edited" : "")}>
                      {post.updatedAt !== post.createdAt? 
                        <span className="post-edited"><FontAwesomeIcon icon={icons.pencil} title="Edited" />{" "}</span> : ""
                      }
                      <ReactTimeAgo date={new Date(post.updatedAt)} timeStyle="mini" locale={languageContext} />
                    </div>
                    <div className="abs-date text-xs">
                      <div>{dayFormat.format(new Date(post.updatedAt))}</div>
                      <div>{dateFormat.format(new Date(post.updatedAt))}</div>
                      <div>{timeFormat.format(new Date(post.updatedAt))}</div>
                    </div>
                  </span>
              </Link>
            </span>
                
            <span className="post-author w-3/4">
              <span className="visually-hidden">By</span>
              <PersonInline person={post.authorPerson} />
            </span>
          </span>
        </CardHeader>
        <CardBody>
          {(post.type ?? "text") === "text" && <div className="post-text post-text-text e-content" lang={post.language}>{post.text}</div>}
          {post.type === "markdown" && <div className="post-text post-text-markdown e-content" lang={post.language}><Markdown>{post.text}</Markdown></div>}
          <ImageList post={post} />
          {post.boostedPosts && post.boostedPosts.length > 0 &&
            <blockquote className="quote-boosted-posts">
              {post.boostedPosts.map(boostedPost => 
                <Post showStats={false} key={boostedPost.uri} post={boostedPost}  />
              )}
            </blockquote>
          }
        </CardBody>

        {showStatsForReal && 
          <CardFooter>
            <aside id={htmlId} className="post-stats" aria-labelledby={htmlId+'-header'}>
              <span className="post-stats-header visually-hidden" id={htmlId+'-header'}>Stats {user && <> and Actions </>}</span>
              
              <ul aria-labelledby={htmlId+'-header'} className="post-stat-bar flex flex-wrap">
                <li className="post-stat post-stat-replies order-2 mr-4 h-[40px] content-center">
                  {user?
                    <Button ref={replyButtonRef} variant="light" onPress={(e) => { setComposingReply(true); }}>
                      <NumReplies post={post} numReplies={numReplies} />
                    </Button>
                    :
                    <div ref={replyButtonRef} variant="light">
                      <NumReplies post={post} numReplies={numReplies} />
                    </div>
                  }
                </li>
                <Boosts onBoost={onBoost} post={post} />
                <li className="post-stat more-options-menu order-2">
                  <PostDetailsMenu post={post} />
                </li>
                <li className="reactions post-stat order-1 w-full"><Reactions post={post} onReact={onReact} /></li>
              </ul>
            </aside>
          </CardFooter>
        }
      </Card>
    </>
  );

  const postWithoutChildren = showReplyLevel?
    <ReplyLevel post={post}>{thePost}</ReplyLevel>
    :
    <>{thePost}</>
  ;

  return (
    <article className={"post h-entry "+className}>
      {postWithoutChildren}
      {children}
    </article>
  );
});

export default Post;
