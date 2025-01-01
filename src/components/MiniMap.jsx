import {Avatar, AvatarGroup, AvatarIcon} from "@nextui-org/avatar";
import hashSum from 'hash-sum'
import { useEffect } from 'react'

import Corner from './corner-svg.jsx'

import '../static/MiniMap.css'

export default function MiniMap({threadOrder}) {

  // Set the heights of the minimap posts based on the heights of the real posts.
  useEffect(() => {
    const threadMain = document.getElementById('thread-main');
    const threadHeight = threadMain.getBoundingClientRect().height;
    const postHeights = {};

    for (const section of threadMain.getElementsByTagName('section')) {
      for (const threadedPost of section.children) {
        const hash = threadedPost.id.substring('threaded-post-'.length);
        postHeights[hash] = threadedPost.getBoundingClientRect().height;
      }
    }

    for (const minimapPost of document.getElementById('minimap').children) {
      const hash = minimapPost.id.substring('minimap-'.length);
      const height = postHeights[hash];
      minimapPost.style = "height: "+(height/threadHeight * 100)+"%;";
    }
  });


  // Set the size of the minimap scrollbar thumb based on the viewport.
  useEffect(() => {
    const threadMain = document.getElementById('thread-main');
    const threadHeight = threadMain.getBoundingClientRect().height;
    const threadTop = threadMain.offsetTop;

    // Technically, we don't want the height of the actual viewport.  We want
    // the height of the rectangle where the viewport intersects the thread.
    const viewportTop = (window.visualViewport.pageTop < threadTop? threadTop : window.visualViewport.pageTop) - threadTop;
    const viewportBottom = window.visualViewport.pageTop + window.visualViewport.height - threadTop;
    const viewportHeight = viewportBottom - viewportTop;

    console.log("T B H", viewportTop, viewportBottom, viewportHeight);

    const minimapTop = viewportTop / threadHeight * 100;
    const minimapHeight = viewportHeight / threadHeight * 100;

    console.log(viewportTop, viewportBottom, viewportHeight);

    const minimapThumb = document.getElementById('minimap-scrollbar-thumb');
    // minimapThumb.style = `top: ${minimapTop}vw; height: ${minimapHeight}vw;`
    minimapThumb.style = `top: ${minimapTop}vh; height: ${minimapHeight}vh;`

    console.log(minimapThumb.style);
  });

  return (<aside id="minimap">
    <div id="minimap-scrollbar-thumb"></div>
    {threadOrder.map(({post, inReplyTo}) => {
      return <MiniMapNode key={post.uri} post={post} inReplyTo={inReplyTo} />
    })}
  </aside>);
}

function MiniMapNode({post, inReplyTo}) {
  const avatarFallbackColor = hashSum(post.authorPerson.handle).substring(0,6).toUpperCase();

  return (<div id={"minimap-"+hashSum(post.uri).toString(16)} className="minimap-threaded-post flex">
  {inReplyTo.length > 0? 
    <ul>
      {inReplyTo.map(inReplyTo  => {
        const {drawThreadLine, hasBranch, hasReplies, collapsed} = inReplyTo;
        const postRepliedTo = inReplyTo.post;

        return (
        <li key={postRepliedTo.uri} className={(collapsed? collapsed : drawThreadLine) + (hasBranch? " has-branch " : " ") + (hasReplies? " has-replies " : " ")}>
          <a href={"#p"+hashSum(postRepliedTo.uri).toString(16)} className="thread-handle"><Corner />
          </a>
        </li>
        );
      })}
    </ul>
    : ""
  }

  <div className="minimap-post">
    <Avatar isBordered radius="full" src={post.authorPerson.avatar} name={post.authorPerson.displayName} 
      style={{'--avatar-bg': '#'+avatarFallbackColor}}
      classNames={{base: "avatar bg-[--avatar-bg]"}}
    />
  </div>

  </div>);
}
