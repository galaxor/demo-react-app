import LanguageContext from './LanguageContext.jsx'
import NumberDisplay from './components/NumberDisplay.jsx'
import PersonInline from './PersonInline.jsx';
import PostAndYourNewReplies from './PostAndYourNewReplies.jsx';
import ReactionGlyph from './ReactionGlyph.jsx'
import PostDetailsContext from './PostDetailsContext.jsx';

import hashSum from 'hash-sum'
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLoaderData, Link } from "react-router-dom";
import ReactTimeAgo from 'react-time-ago';
import {Tabs, Tab} from "@nextui-org/tabs";

import './static/ReactionsDetail.css'

export default function ReactionsDetail() {
  const post = useLoaderData().post;
  const languageContext = useContext(LanguageContext);

  const { reactionsList, setReactionsList } = useContext(PostDetailsContext);

  const totalNumReactions = reactionsList
    .map(reactionType => reactionType.reactors.length)
    .reduce(((partialSum, numReactions) => partialSum + numReactions), 0)
    ;

  // XXX You should be able to search the list of people who reacted to the post.
  // Especially since, one day, this might be paged, in case some post has like 29k reactions.

  return (
    <>
      <h2 id="reactions-toc-header" className="my-5 text-xl font-bold">Reactions</h2>

      {/* Make a table of contents of the different kinds of reactions */}
      {reactionsList.length <= 0?
        <> No reactions. </>
        :
        <Tabs aria-labelledby="reactions-toc-header" className="reactions-toc"
          classNames={{tabList: "flex-wrap", tab: "w-auto"}}
        >
          <Tab key="all" title={<>All <NumberDisplay number={totalNumReactions} compact={true} /></>}>
            <h3 id="all-reactions" className="my-5 text-lg font-bold">All Reactions (<NumberDisplay number={totalNumReactions} />)</h3>

            <ul className="reactors" aria-labelledby="all-reactions">
            {reactionsList.map(reactionType => {
              const key = hashSum([reactionType.type, reactionType.unicode, reactionType.reactName, reactionType.reactServer, encodeURIComponent(reactionType.reactUrl)].join(':'));

              return reactionType.reactors.map(person => {
                return (
                  <li key={key+':'+person.handle} className="reactor flex gap-5 items-center mb-2"><ReactionGlyph reaction={reactionType} /> <PersonInline person={person} /></li>
                );
              })
            })}
            </ul>
          </Tab>

        {reactionsList.map(reactionType => {
          const key = hashSum([reactionType.type, reactionType.unicode, reactionType.reactName, reactionType.reactServer, encodeURIComponent(reactionType.reactUrl)].join(':'));

          return (
            <Tab key={key} title={<><div className="flex flex-nowrap"><ReactionGlyph reaction={reactionType} /> <span className="ml-1"><NumberDisplay number={reactionType.reactors.length} compact={true} /></span></div></>}>
              <h3 id={key+'-header'} className="my-5 text-lg font-bold"><div className="flex flex-nowrap items-center"><ReactionGlyph reaction={reactionType} /> <span className="ml-1"><NumberDisplay number={reactionType.reactors.length} /></span></div></h3>

              <ul className="reactors" aria-labelledby={key+'-header'}>
              {reactionType.reactors.map(person => {
                return (
                  <li key={key+':'+person.handle} className="reactor mb-2"><PersonInline person={person} /></li>
                );
              })}
              </ul>
            </Tab>
          );
        })}
        </Tabs>
      }
    </>
  );
}
