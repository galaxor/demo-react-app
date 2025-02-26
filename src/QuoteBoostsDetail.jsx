import NumberDisplay from './components/NumberDisplay.jsx'
import PersonInline from './PersonInline.jsx';
import PostAndYourNewReplies from './PostAndYourNewReplies.jsx';
import PostDetailsContext from './PostDetailsContext.jsx'
import PostsList from './PostsList.jsx';
import LanguageContext from './LanguageContext.jsx'
import UserContext from './UserContext.jsx'

import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useLoaderData } from "react-router-dom";
import ReactTimeAgo from 'react-time-ago';

export default function QuoteBoostsDetail() {
  const dateFormat = new Intl.DateTimeFormat(navigator.language, {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short'
  });

  const post = useLoaderData().post;
  const languageContext = useContext(LanguageContext);
  const {user, setUser} = useContext(UserContext);

  const { quoteBoostsList, setQuoteBoostsList } = useContext(PostDetailsContext);

  // XXX You should be able to search the list of people who boosted the post.
  // Especially since, one day, this might be paged, in case some post has like 29k boosts.

  return (
    <>
      <h2 className="my-5 text-xl font-bold">{quoteBoostsList.length > 1 || quoteBoostsList.length === 0? 
        <>Quote-Boosted <NumberDisplay number={quoteBoostsList.length} /> times</>
        :
        <>Quote-Boosted <NumberDisplay number={quoteBoostsList.length} /> time</>
      }</h2>

      <PostsList posts={quoteBoostsList} />
    </>
  );
}
