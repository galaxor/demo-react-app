import { Button } from "@nextui-org/button"
import { useContext, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link, NavLink } from 'react-router-dom'
import { Link as Link2 } from "@nextui-org/link"
import LanguageContext from './LanguageContext.jsx'

import DatabaseContext from './DatabaseContext.jsx'
import icons from './icons.js'
import { PostsDB } from './logic/posts.js';
import UserContext from './UserContext.jsx';

export default function Boosts({post, onBoost}) {
  const { user } = useContext(UserContext);
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

  const [numYourBoosts, setNumYourBoosts] = useState(0);
  const [numYourQuoteBoosts, setNumYourQuoteBoosts] = useState(0);

  useEffect(() => {
    (async () => {
      if (user) {
        setNumYourBoosts(await postsDB.getNumberOfBoostsOf(post.uri, {by: user.handle}));
        setNumYourQuoteBoosts(await postsDB.getNumberOfBoostsOf(post.uri, {by: user.handle}));
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
          <span className="total"><NumBoosts uri={post.uri} /></span>
        </Button>
        :
        <div className="stat">
          <span className="icon" aria-label="Boosts"><FontAwesomeIcon icon={icons.repeat} size="lg" /></span> {" "}
          <span className="total"><NumBoosts uri={post.uri} /></span>
        </div>
      }
        
    </li>

    <li className="post-stat quote-boosts order-2 mr-4 h-[40px] content-center">
      {user?
          <Button variant={numYourQuoteBoosts > 0? "flat" : "light"} as={Link2} href={"/quote-boost/"+encodeURIComponent(post.uri)}>
            <span className="visually-hidden">Quote-boost this post</span>
            <span className="icon" aria-label="Quote Boosts"><span className="quoteboost-boost-icon text-background"><FontAwesomeIcon icon={icons.repeat} size="2xs" /></span><span className="quoteboost-comment-icon"><FontAwesomeIcon icon={icons.comment} size="lg" /></span></span> {" "}
            <span className="total"><NumBoosts uri={post.uri} quote={true} /></span>
          </Button>
        :
        <div className="stat relative">
          <span className="icon" aria-label="Quote Boosts"><span className="quoteboost-boost-icon quoteboost-boost-icon-logged-out text-background"><FontAwesomeIcon icon={icons.repeat} size="2xs" /></span><span className="quoteboost-comment-icon"><FontAwesomeIcon icon={icons.comment} size="lg" /></span></span> {" "}
          <span className="total"><NumBoosts uri={post.uri} quote={true} /></span>
        </div>
      }
    </li>
    </>
  );
}

function NumBoosts({uri, quote}) {
  const [numBoosts, setNumBoosts] = useState("?");
  const language = useContext(LanguageContext);

  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

  useEffect(() => {
    (async () => {
      const numBoosts = quote?
        await postsDB.getNumberOfQuoteBoostsOf(uri)
        : await postsDB.getNumberOfBoostsOf(uri)
      ;

      const numBoostsDisplay = Intl.NumberFormat(language, {
        notation: "compact",
        maximumFractionDigits: 1
      }).format(numBoosts);

      setNumBoosts(numBoostsDisplay);
    })();
  }, []);

  return numBoosts;
}

function clickBoosts({user, post, postsDB, numBoosts, setNumBoosts, numYourBoosts, setNumYourBoosts}) {
  // If they did this (boosted the post), we should unboost the post.
  // If they didn't do this, we should boost the post.
  if (numYourBoosts > 0) {
    // unboosting the post
    postsDB.removeBoostsBy({boostedPostUri: post.uri, boosterHandle: user.handle});
  } else {
    // boosting the post
    postsDB.boost({boostedPostUri: post.uri, boosterHandle: user.handle});
  }

  setNumBoosts(postsDB.getNumberOfBoostsOf(post.uri));
  setNumYourBoosts(postsDB.getNumberOfBoostsOf(post.uri, {by: user.handle}));
}
