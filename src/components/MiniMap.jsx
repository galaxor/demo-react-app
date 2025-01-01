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
    const {top, height} = getMinimapThumbDimensions();
    const minimapThumb = document.getElementById('minimap-scrollbar-thumb');
    minimapThumb.style = `top: ${top}vh; height: ${height}vh;`;
  });

  // Set up the scroll handler so that the thumb can follow your scrolling.
  useEffect(() => {
    const minimapThumb = document.getElementById('minimap-scrollbar-thumb');
    var listening = true;
    
    const scrollHandler = (e => {
      if (listening) {
        listening = false;
        window.requestAnimationFrame(() => {
          const {top, height} = getMinimapThumbDimensions();
          minimapThumb.style = `top: ${top}vh; height: ${height}vh;`;
          listening = true;
        });
      }
    });

    window.addEventListener("scroll", scrollHandler);

    return () => {
      window.removeEventListener("scroll", scrollHandler);
    };
  });

  // Set up a media query so that the minimap is only shown if the thread is larger than the viewport.
  useEffect(() => {
    const threadMain = document.getElementById('thread-main');
    const threadHeight = threadMain.getBoundingClientRect().height;
    const styleNode = document.getElementById('minimap-styles');
    styleNode.innerText = `@media (min-height: ${threadHeight}px) { aside#minimap { display: none; } }`;
  });

  return (<aside id="minimap">
    <style id="minimap-styles" type="text/css"></style>
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

function getMinimapThumbDimensions() {
  const threadMain = document.getElementById('thread-main');
  const threadHeight = threadMain.offsetHeight;
  const threadTop = threadMain.offsetTop;
  const scrollY = window.scrollY;

  // Technically, we don't want the height of the actual viewport.  We want
  // the height of the rectangle where the viewport intersects the thread.
  const viewportTop = (window.scrollY < threadTop? threadTop : window.scrollY) - threadTop;
  const viewportBottom = window.scrollY + window.visualViewport.height - threadTop;
  const viewportHeight = viewportBottom - viewportTop;

  const minimapTop = viewportTop / threadHeight * 100;
  const minimapHeight = viewportHeight / threadHeight * 100;

  return {top: minimapTop, height: minimapHeight};
}
