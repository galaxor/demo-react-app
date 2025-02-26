import { PeopleDB } from './logic/people.js';

import NumberDisplay from './components/NumberDisplay.jsx'
import PersonInline from './PersonInline.jsx';
import PostAndYourNewReplies from './PostAndYourNewReplies.jsx';
import PostDetailsContext from './PostDetailsContext.jsx'
import LanguageContext from './LanguageContext.jsx'
import UserContext from './UserContext.jsx'

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLoaderData } from "react-router-dom";
import ReactTimeAgo from 'react-time-ago';

import './static/BoostsDetail.css'

export default function BoostsDetail() {
  const dateFormat = new Intl.DateTimeFormat(navigator.language, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short'
  });

  const post = useLoaderData().post;
  const languageContext = useContext(LanguageContext);

  const { boostsList, setBoostsList } = useContext(PostDetailsContext);

  // XXX You should be able to search the list of people who boosted the post.
  // Especially since, one day, this might be paged, in case some post has like 29k boosts.

  return (
    <>
    <h2 className="my-5 text-xl font-bold">{boostsList.length > 1 || boostsList.length === 0 ? 
      <>Boosted by <NumberDisplay number={boostsList.length} /> people</>
      :
      <>Boosted by 1 person</>
    }</h2>

    {boostsList.length <= 0? "No boosts." :
      <ul className="boosts-detail">
      {boostsList.map(post => {
        const key=encodeURIComponent(post.uri);
        const authorPerson = post.authorPerson;

        return (
          <li key={key}><PersonInline person={authorPerson} />
            <time dateTime={post.updatedAt}>
              <span className="time-ago"><ReactTimeAgo date={new Date(post.updatedAt)} locale={languageContext} /></span>
              {" "} &mdash; {" "}
              <span className="abs-date">{dateFormat.format(new Date(post.updatedAt))}</span>
            </time>
          </li>
        );
      })}
      </ul>
    }
    </>
  );
}
