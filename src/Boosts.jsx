import { Button } from "@nextui-org/button"
import { useContext, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link, NavLink } from 'react-router-dom'
import { Link as Link2 } from "@nextui-org/link"
import LanguageContext from './LanguageContext.jsx'

import DatabaseContext from './DatabaseContext.jsx'
import icons from './icons.js'
import NumberDisplay from './components/NumberDisplay.jsx'
import { PostsDB } from './logic/posts.js';
import UserContext from './UserContext.jsx';

export default function Boosts({post, onBoost}) {
  const { user } = useContext(UserContext);
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

  const [numYourBoosts, setNumYourBoosts] = useState(0);
  const [numYourQuoteBoosts, setNumYourQuoteBoosts] = useState(0);

  const [numBoosts, setNumBoosts] = useState(0);
  const [numQuoteBoosts, setNumQuoteBoosts] = useState(0);

  useEffect(() => {
    (async () => {
      if (user) {
        setNumYourBoosts(await postsDB.getNumberOfBoostsOf(post.uri, {by: user.handle}));
        setNumYourQuoteBoosts(await postsDB.getNumberOfBoostsOf(post.uri, {by: user.handle, quote: true}));

        setNumBoosts(await postsDB.getNumberOfBoostsOf(post.uri));
        setNumQuoteBoosts(await postsDB.getNumberOfBoostsOf(post.uri, {quote: true}));
      }
    })();
  }, [user]);

  const htmlId = encodeURIComponent(post.uri)+'-boosts';

  return (
    <>
    <li className="post-stat non-quote-boosts order-2 mr-1 h-[40px] content-center">
      {user? 
        <Button variant={numYourBoosts > 0? "flat" : "light"} className="stat" onPress={e => {
          clickBoosts({user, post, postsDB, numBoosts, setNumBoosts, numYourBoosts, setNumYourBoosts});
          if (typeof onBoost === "function") { onBoost(); }
        }}>
          <span className="visually-hidden">Boost this post</span>
          <span className="icon" aria-label="Boosts"><FontAwesomeIcon icon={icons.repeat} size="lg" /></span> {" "}
          <span className="total"><NumberDisplay number={numBoosts} compact={true} /></span>
        </Button>
        :
        <div className="stat">
          <span className="icon" aria-label="Boosts"><FontAwesomeIcon icon={icons.repeat} size="lg" /></span> {" "}
          <span className="total"><NumberDisplay number={numBoosts} compact={true} /></span>
        </div>
      }
        
    </li>

    <li className="post-stat quote-boosts order-2 mr-4 h-[40px] content-center">
      {user?
          <Button variant={numYourQuoteBoosts > 0? "flat" : "light"} as={Link2} href={"/quote-boost/"+encodeURIComponent(post.uri)}>
            <span className="visually-hidden">Quote-boost this post</span>
            <span className="icon" aria-label="Quote Boosts"><span className="quoteboost-boost-icon text-background"><FontAwesomeIcon icon={icons.repeat} size="2xs" /></span><span className="quoteboost-comment-icon"><FontAwesomeIcon icon={icons.comment} size="lg" /></span></span> {" "}
            <span className="total"><NumberDisplay number={numQuoteBoosts} compact={true} /></span>
          </Button>
        :
        <div className="stat relative">
          <span className="icon" aria-label="Quote Boosts"><span className="quoteboost-boost-icon quoteboost-boost-icon-logged-out text-background"><FontAwesomeIcon icon={icons.repeat} size="2xs" /></span><span className="quoteboost-comment-icon"><FontAwesomeIcon icon={icons.comment} size="lg" /></span></span> {" "}
          <span className="total"><NumberDisplay number={numQuoteBoosts} compact={true} /></span>
        </div>
      }
    </li>
    </>
  );
}

async function clickBoosts({user, post, postsDB, numBoosts, setNumBoosts, numYourBoosts, setNumYourBoosts}) {
  // If they did this (boosted the post), we should unboost the post.
  // If they didn't do this, we should boost the post.
  if (numYourBoosts > 0) {
    // unboosting the post
    await postsDB.removeBoostsBy({boostedPostUri: post.uri, boosterHandle: user.handle});
  } else {
    // boosting the post
    await postsDB.boost({boostedPostUri: post.uri, boosterHandle: user.handle});
  }

  setNumBoosts(await postsDB.getNumberOfBoostsOf(post.uri));
  setNumYourBoosts(await postsDB.getNumberOfBoostsOf(post.uri, {by: user.handle}));
}
