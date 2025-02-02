import { PeopleDB } from './logic/people.js';
import { PostsDB } from './logic/posts.js';

import PersonInline from './PersonInline.jsx';
import PostAndYourNewReplies from './PostAndYourNewReplies.jsx';
import PostsList from './PostsList.jsx';
import DatabaseContext from './DatabaseContext.jsx'
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
  const db = useContext(DatabaseContext);
  const {user, setUser} = useContext(UserContext);

  const peopleDB = new PeopleDB(db);
  const postsDB = new PostsDB(db);

  function getNumQuoteBoosts() { return postsDB.getNumberOfQuoteBoostsOf(post.uri); }
  function getNumYourQuoteBoosts() { return user? postsDB.getNumberOfQuoteBoostsOf(post.uri, {by: user.handle}) : 0; }
  const [numQuoteBoosts, setNumQuoteBoosts] = useState(getNumQuoteBoosts());
  const [numYourQuoteBoosts, setNumYourQuoteBoosts] = useState(getNumYourQuoteBoosts());

  // Reset the boosts if you log in, so you can see if you're included among them.
  useEffect(() => {
    setNumQuoteBoosts(getNumQuoteBoosts());
    setNumYourQuoteBoosts(getNumYourQuoteBoosts());
  }, [user, setNumQuoteBoosts, setNumYourQuoteBoosts]);

  function getQuoteBoostPostsList() {
    const quoteBoostPosts = postsDB.getQuoteBoostsOf(post.uri);

    // We now have { handle1: boost-row-1, handle2: boost-row-2 }
    // We want a list of the boostersPosts.
    const quoteBoostPostsList = Object.values(quoteBoostPosts)
      .map(row => row.boostersPost)
    ;

    quoteBoostPostsList.sort((a, b) => a.updatedAt===b.updatedAt? 0 : (a.updatedAt < b.updatedAt)? 1 : 0);
    return quoteBoostPostsList;
  }

  const quoteBoostPostsList = getQuoteBoostPostsList();

  // XXX You should be able to search the list of people who boosted the post.
  // Especially since, one day, this might be paged, in case some post has like 29k boosts.

  return (
    <>
      <h2 className="my-5 text-xl font-bold">{numQuoteBoosts > 1 || numQuoteBoosts === 0? 
        <>Quote-Boosted {numQuoteBoosts} times</>
        :
        <>Quote-Boosted {numQuoteBoosts} time</>
      }</h2>

      <PostsList posts={quoteBoostPostsList} />
    </>
  );
}
