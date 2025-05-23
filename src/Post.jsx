import { Button } from "@nextui-org/button"
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card"
import { forwardRef, useContext, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import hashSum from 'hash-sum'
import { Link, NavLink } from 'react-router-dom'
import { useNavigate } from "react-router"
import ReactTimeAgo from 'react-time-ago'
import TimeAgo from 'javascript-time-ago'
import Markdown from 'react-markdown'

import Boosts from './Boosts.jsx'
import DatabaseContext from './DatabaseContext'
import DangerousHTML from './components/DangerousHTML.jsx'
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
import TombstonePost from './components/TombstonePost.jsx'
import UserContext from './UserContext.jsx'

import { fullDateTime, dayFormat, dateFormat, timeFormat } from './timeFormat.js'

import './static/Post.css'

const Post = forwardRef(function Post2(props, ref) {
  const {id, post: postPassedIn, composingReply, setComposingReply, editingPost, setEditingPost, numReplies, setNumReplies, children, showStats, showReplyBanner, onBoost, onReact, className, showReplyLevel, scrollHereRef, highlight, onDelete, isMainPost, onHoverReplyFn, onUnhoverReplyFn} = props;

  const [post, setPost] = useState(postPassedIn);

  const postId = id? id : "p"+(hashSum(post.uri).toString(16));

  // showStats defaults to true.
  const showStatsForReal = ((typeof showStats === "undefined")? true : showStats) && post.deletedAt === null;

  const languageContext = useContext(LanguageContext);
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

  const replyButtonRef = useRef(null);

  const postDivRef = useRef(null);
  const childPostRef = useRef(null);

  if (ref !== null && typeof ref.current !== "undefined") {
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

  const [replyingToPost, setReplyingToPost] = useState(null);
  useEffect(() => {
    (async () => {
      setReplyingToPost(showReplyBanner && post.inReplyTo? await postsDB.get(post.inReplyTo) : null);
    })();
  }, []);

  const replyingToPostId = replyingToPost? hashSum(replyingToPost.uri).toString(16) : undefined;
  const onHoverReply = replyingToPost? onHoverReplyFn(replyingToPostId) : undefined;
  const onUnhoverReply = replyingToPost? onUnhoverReplyFn(replyingToPostId) : undefined;


  // We're using ReactTimeAgo in the markup, but plain javascript-time-ago in the aria.
  const timeAgo = new TimeAgo(languageContext);

  const navigate = useNavigate();

  if (replyingToPost && replyingToPost.authorPerson.handle === null) {
    throw new Error("Bad post");
  }

  const thePost = post.deletedAt !== null? <TombstonePost/>
    :(<>
      {replyingToPost && 
        <div className="reply-info">
          <Link to={"/post/"+encodeURIComponent(replyingToPost.uri)}
            onPointerEnter={onHoverReply}
            onFocus={onHoverReply}

            onPointerLeave={onUnhoverReply}
            onBlur={onUnhoverReply}
          >
            <FontAwesomeIcon icon="comment" /> Replying to <PersonName person={replyingToPost.authorPerson} />
          </Link>
        </div>
      }

      {editingPost?
        <PostEditor 
          editingPost={post}
          quotedPost={post.boostedPosts && post.boostedPosts.length > 0? post.boostedPosts[0] : undefined}
          onSave={newPost => { setEditingPost(false); setPost(newPost); }}
          onCancel={() => setEditingPost(false)}
          replyingTo={post.inReplyTo} 
          conversationId={post.conversationId}
        />
      :
      <Card id={postId? postId.toString() : ""} ref={postDivRef} className={"post overflow-visible hover:bg-default-100 "+(highlight? 'ring-2 ring-inset ring-default-500 ' : " ")+(className ?? "")}>
        <CardHeader>
          {typeof scrollHereRef !== "undefined"? <div ref={scrollHereRef} id={"scroll-target-"+postId.toString(16)} className="scroll-into-view"></div> : ""}
          <cite className="post-metadata w-full flex justify-between not-italic">
            <span className="post-date order-1 text-right"
              aria-label={post.updatedAt === post.createdAt?
                "Posted "+timeAgo.format(new Date(post.updatedAt))+", "+fullDateTime.format(new Date(post.updatedAt))
                :
                "Updated "+timeAgo.format(new Date(post.updatedAt))+", "+fullDateTime.format(new Date(post.updatedAt))}>
                {post.updatedAt !== post.createdAt? 
                  <Link to={`/post/${encodeURIComponent(post.uri)}/history`} className="text-xl" aria-label="View revision history">
                      <span className="post-edited"><FontAwesomeIcon icon={icons.pencil} title="Edited" />{" "}</span> 
                  </Link>
                  : ""
                }
              <Link className="post-time dt-published" to={'/post/' + encodeURIComponent(post.uri)}>
                  <span className={"text-xl time-ago " + (post.updatedAt !== post.createdAt? "time-ago-edited" : "")}>
                    <ReactTimeAgo date={new Date(post.updatedAt)} timeStyle="mini" locale={languageContext} />
                  </span>
                  <span className="dt-published published-date">
                    <div className="abs-date text-xs">
                      <div>{dayFormat.format(new Date(post.updatedAt))}</div>
                      <div>{dateFormat.format(new Date(post.updatedAt))}</div>
                      <div>{timeFormat.format(new Date(post.updatedAt))}</div>
                    </div>
                  </span>
              </Link>
            </span>
                
            <span className="post-author w-3/4 p-author">
              <span className="visually-hidden">By</span>
              <PersonInline person={post.authorPerson} />
            </span>
          </cite>
        </CardHeader>
        <CardBody>
          {(post.type ?? "text") === "text" && <div className="post-text post-text-text e-content" lang={post.language}>{post.text}</div>}
          {post.type === "markdown" && <div className="post-text post-text-markdown e-content" lang={post.language}><Markdown>{post.text}</Markdown></div>}

          {post.type === "html" && <div className="post-text post-text-markdown e-content" lang={post.language}><DangerousHTML>{post.text}</DangerousHTML></div>}
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
              
              <ul aria-labelledby={htmlId+'-header'} className={"post-stat-bar flex flex-wrap " + ((user === null)? "" : "editable")}>
                <li className="post-stat post-stat-replies order-2 mr-1 h-[40px] content-center">
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
                  <PostDetailsMenu post={post} onDelete={onDelete} editingPost={editingPost} setEditingPost={setEditingPost} />
                </li>
                <li className="reactions post-stat order-1 w-full"><Reactions post={post} onReact={onReact} /></li>
              </ul>
            </aside>
          </CardFooter>
        }
      </Card>
      }
    </>
  );

  return (
    <article className={`post h-entry ${isMainPost? "main-post" : ""} ${className ?? ""}`}>
      {thePost}
      {children}
    </article>
  );
});

export default Post;
