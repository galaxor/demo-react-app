import Avatar from './Avatar.jsx'
import hashSum from 'hash-sum'
import { useEffect } from 'react'

import Corner from './corner-svg.jsx'

import '../static/MiniMap.css'

export default function MiniMap({threadOrder}) {

  // Set the heights of the minimap posts based on the heights of the real posts.
  useEffect(() => {
    const threadMain = document.getElementById('thread-main');
    if (!threadMain) {
      // It would spew errors as you moved from a Thread page to a details page.
      // The errors were related to threadMain not existing.  Let's just
      // quietly exit in that situation.
      return;
    }

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

  var scrollHandlerEnabled = true;

  // Set up the scroll handler so that the thumb can follow your scrolling.
  useEffect(() => {
    const minimapThumb = document.getElementById('minimap-scrollbar-thumb');
    
    const scrollHandler = (e => {
      if (scrollHandlerEnabled) {
        scrollHandlerEnabled = false;
        window.requestAnimationFrame(() => {
          const {top, height} = getMinimapThumbDimensions();
          minimapThumb.style = `top: ${top}vh; height: ${height}vh;`;
          scrollHandlerEnabled = true;
        });
      }
    });

    window.addEventListener("scroll", scrollHandler);

    return () => {
      window.removeEventListener("scroll", scrollHandler);
    };
  });

  // Set up a media query so that the minimap is only shown if the thread is larger than the viewport.
  // Also set it up so if you hover over a post in real life, it highlights it in the minimap.
  useEffect(() => {
    const threadMain = document.getElementById('thread-main');
    const threadHeight = threadMain.getBoundingClientRect().height;
    const styleNode = document.getElementById('minimap-styles');


    // If you hover over a post in real life, highlight it on the minimap too.
    // And when you hover over a minimap post, it should highlight the real post.
    const styleRules = [
      `@media (height >= ${threadHeight}px) { aside#minimap { display: none; } }`,
    ];

    const minimap = document.getElementById('minimap');
    for (const minimapPost of minimap.children) {
      // There's a couple things other than posts in here.
      if (minimapPost.tagName !== "DIV" || minimapPost.id === "minimap-scrollbar-thumb") { continue; }

      // The rest is posts.
      const hash = minimapPost.id.substring('minimap-'.length);

      styleRules.push(`body:has(#threaded-post-${hash}:hover) #${minimapPost.id} { background: hsl(var(--nextui-default-300)); }`);
      styleRules.push(`body:has(div#${minimapPost.id}:hover) #p${hash} { background: hsl(var(--nextui-default-100)); }`);
    }

    styleNode.innerText = styleRules.join(" ");
  });

  // Set it up so you can click on the minimap to insta-scroll to that area,
  // and it'll keep following your mouse until you release the button.
  useEffect(() => {
    const pointerMoveFn = (e => {
      window.requestAnimationFrame(() => {
        minimapScroll(e.clientY);
      });
    });

    const pointerDownFn = (e => {
      if (e.button > 0) { return; }

      e.preventDefault();

      window.addEventListener("pointermove", pointerMoveFn);
      window.addEventListener("pointerup", () => {
        window.removeEventListener("pointermove", pointerMoveFn); 
      });

      minimapScroll(e.clientY);
    });

    minimap.addEventListener("pointerdown", pointerDownFn);

    return () => {
      if (typeof minimap !== "undefined") {
        minimap.removeEventListener("pointerdown", pointerDownFn);
      }
    };
  });
  

  return (<aside id="minimap">
    <style id="minimap-styles" type="text/css"></style>
    <div id="minimap-scrollbar-thumb"></div>
    {threadOrder.map(({post, threadHandles}) => {
      return <MiniMapNode key={post.uri} post={post} threadHandles={threadHandles} />
    })}
  </aside>);
}

function MiniMapNode({post, threadHandles}) {
  return (<div id={"minimap-"+hashSum(post.uri).toString(16)} className="minimap-threaded-post flex">
  {threadHandles.length > 0? 
    <ul>
      {threadHandles.map(threadHandle  => {
        return (
        <li key={threadHandle.pointsToPost.uri} className={threadHandle.glyph}>
          <div data-href={"#p"+hashSum(threadHandle.pointsToPost.uri).toString(16)} className="thread-handle"><Corner /></div>
        </li>
        );
      })}
    </ul>
    : ""
  }

  <div className={`minimap-post p${hashSum(post.uri).toString(16)}`}>
    {post.deletedAt === null?
      <Avatar person={post.authorPerson} />
      :
      <Avatar />
    }
  </div>

  </div>);
}

function getMinimapThumbDimensions() {
  const threadMain = document.getElementById('thread-main');
  if (!threadMain) {
    // It would spew errors as you moved from a Thread page to a details page.
    // The errors were related to threadMain not existing.  Let's just
    // quietly exit in that situation.
    return {top: 0, height: 0};
  }

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

function minimapScroll(pointerY) {
  const threadMain = document.getElementById('thread-main');
  const threadHeight = threadMain.getBoundingClientRect().height;
  const minimap = document.getElementById('minimap');
  const minimapThumb = document.getElementById('minimap-scrollbar-thumb');
  const thumbHeight = minimapThumb.offsetHeight;

  // Set the middle of the thumb to be at the height you clicked.
  const newThumbTop = (pointerY - minimap.offsetTop - (thumbHeight / 2)) < 0 ? 
    0
    : (pointerY - minimap.offsetTop - (thumbHeight / 2))
  ;

  // Make sure it can't go below the screen.
  const newThumbTop2 = newThumbTop <= (window.visualViewport.height - thumbHeight)? 
    newThumbTop
    : window.visualViewport.height - thumbHeight
  ;

  const newScrollPos = newThumbTop2 / minimap.offsetHeight * threadHeight + threadMain.offsetTop;
  window.scrollTo({top: newScrollPos, behavior: "smooth"});

  // We're not going to change the thumb in the DOM.  We'll just do the
  // scrolling and then let the scroll handler follow it and redraw the DOM.
  // const newThumbTopPct = newThumbTop2 / minimap.offsetHeight * 100;
  // minimapThumb.style.top = `${newThumbTopPct}vh`;
}
