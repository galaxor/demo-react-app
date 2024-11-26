import { useContext, useState } from 'react'
import { Link } from 'react-router-dom'

import DatabaseContext from './DatabaseContext.jsx'
import { PostsDB } from './logic/posts.js';
import UserContext from './UserContext.jsx';

export default function Boosts({post}) {
  const { user } = useContext(UserContext);
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

  const [numberOfBoosts, setNumberOfBoosts] = useState();
  const [youDidThis, setYouDidThis] = useState();

  const [numberOfQuoteBoosts, setNumberOfQuoteBoosts] = useState();
  const [youQuoteBoosted, setYouQuoteBoosted] = useState();

  // XXX This won't work at scale. No reason we have to actually pull down all
  // the posts.  Just ask the database for the number of them.
  // On the details page, we can get a paged version of the query.
  const boostsOfPost = postsDB.getBoostsOf(post.uri);
  const didYouDoThis = user && typeof boostsOfPost[user.handle] !== "undefined";

  // XXX Same here.
  const quoteBoosts = postsDB.getQuoteBoostsOf(post.uri);
  const yourQuoteBoosts = user? quoteBoosts.filter(boost => boost.booster === user.handle) : [];

  const htmlId = encodeURIComponent(post.uri)+'-boosts';

  return (
    <>
    <span id={htmlId} className="boosts-header">
      Boosts
    </span>
    <ul aria-labelledby={htmlId}>
      <li className={'non-quote-boosts ' + ((typeof youDidThis === "undefined"? didYouDoThis : youDidThis) && 'you-did-this')}>
        {user? 
          <Link to="/" onClick={e => { e.preventDefault(); clickBoosts({user, post, postsDB, numberOfBoosts, setNumberOfBoosts, setYouDidThis})}}>
            <span className="icon" aria-label="Boosts">♻</span>
            <span className="total">{typeof numberOfBoosts === "undefined"? Object.keys(boostsOfPost).length : numberOfBoosts}</span>
          </Link>
          :
          <div>
            <span className="icon" aria-label="Boosts">♻</span>
            <span className="total">{typeof numberOfBoosts === "undefined"? Object.keys(boostsOfPost).length : numberOfBoosts}</span>
          </div>
        }
          
      </li>

      <li className={'quote-boosts ' + ((typeof yourQuoteBoosts === "undefined"? didYouDoThis : youDidThis) && 'you-did-this')}>
        <div>
          <span className="icon" aria-label="Quote Boosts">♻💬</span>
          <span className="total">{typeof numberOfQuoteBoosts === "undefined"? quoteBoosts.length : numberOfQuoteBoosts}</span>
        </div>
      </li>
    </ul>
    </>
  );
}

function clickBoosts({user, post, postsDB, numberOfBoosts, setNumberOfBoosts, setYouDidThis}) {
  const boostsOfPost = postsDB.getBoostsOf(post.uri);
  const youDidThis = typeof boostsOfPost[user.handle] !== "undefined";

  // If they did this (boosted the post), we should unboost the post.
  // If they didn't do this, we should boost the post.
  if (youDidThis) {
    // unboosting the post
    postsDB.removeBoostsBy({boostedPostUri: post.uri, boosterHandle: user.handle});
    setYouDidThis(false);
    setNumberOfBoosts(Object.keys(boostsOfPost).length - 1);
  } else {
    // boosting the post
    postsDB.boost({boostedPostUri: post.uri, boosterHandle: user.handle});
    setYouDidThis(true);
    setNumberOfBoosts(Object.keys(boostsOfPost).length + 1);
  }

}
