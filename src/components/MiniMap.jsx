import {Avatar, AvatarGroup, AvatarIcon} from "@nextui-org/avatar";
import hashSum from 'hash-sum'
import { useEffect } from 'react'

import Corner from './corner-svg.jsx'

import '../static/MiniMap.css'

export default function MiniMap({threadOrder}) {
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
      console.log(height, threadHeight, "height: "+(height/threadHeight * 100)+"%;");
      minimapPost.style = "height: "+(height/threadHeight * 100)+"%;";
    }
  });

  return (<aside id="minimap">
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
