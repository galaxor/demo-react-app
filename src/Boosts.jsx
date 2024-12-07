import { Button } from "@nextui-org/button"
import { useContext, useEffect, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link, NavLink } from 'react-router-dom'
import { Link as Link2 } from "@nextui-org/link"

import DatabaseContext from './DatabaseContext.jsx'
import icons from './icons.js'
import { PostsDB } from './logic/posts.js';
import UserContext from './UserContext.jsx';

export default function Boosts({post, onBoost}) {
  const { user } = useContext(UserContext);
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

  function getNumBoosts() { return postsDB.getNumberOfBoostsOf(post.uri); }
  function getNumYourBoosts() { return user? postsDB.getNumberOfBoostsOf(post.uri, {by: user.handle}) : 0; }

  function getNumQuoteBoosts() { return postsDB.getNumberOfQuoteBoostsOf(post.uri); }
  function getNumYourQuoteBoosts() { return user? postsDB.getNumberOfQuoteBoostsOf(post.uri, {by: user.handle}) : 0; }

  const [numBoosts, setNumBoosts] = useState(getNumBoosts());
  const [numYourBoosts, setNumYourBoosts] = useState(getNumYourBoosts());

  const [numQuoteBoosts, setNumQuoteBoosts] = useState(getNumQuoteBoosts());
  const [numYourQuoteBoosts, setNumYourQuoteBoosts] = useState(getNumYourQuoteBoosts());

  useEffect(() => {
    setNumBoosts(getNumBoosts());
    setNumYourBoosts(getNumYourBoosts());

    setNumQuoteBoosts(getNumQuoteBoosts());
    setNumYourQuoteBoosts(getNumYourQuoteBoosts());
  }, [user, setNumBoosts, setNumYourBoosts, setNumQuoteBoosts, setNumYourQuoteBoosts]);

  const htmlId = encodeURIComponent(post.uri)+'-boosts';

  return (
    <>
    <span id={htmlId} className="boosts-header visually-hidden">
      Boosts
    </span>
    <ul className="boosts" aria-labelledby={htmlId}>
      <li className={'non-quote-boosts ' + (numYourBoosts > 0 ? 'you-did-this' : '')}>
        <NavLink className="stat-destination show-post-boosts" to={"/post/"+encodeURIComponent(post.uri)+"/boosts"}>Boosts</NavLink>
        {user? 
          <Link to="/" className="stat" onClick={e => {
            e.preventDefault();
            clickBoosts({user, post, postsDB, numBoosts, setNumBoosts, numYourBoosts, setNumYourBoosts});
            if (typeof onBoost === "function") { onBoost(); }
          }}>
            <span className="icon" aria-label="Boosts"><FontAwesomeIcon icon={icons.repeat} /></span> {" "}
            <span className="total">{numBoosts}</span>
          </Link>
          :
          <div className="stat">
            <span className="icon" aria-label="Boosts"><FontAwesomeIcon icon={icons.repeat} /></span> {" "}
            <span className="total">{numBoosts}</span>
          </div>
        }
          
      </li>

      <li className={'quote-boosts ' + (numYourQuoteBoosts > 0? 'you-did-this' : '')}>
        {user?
            <Button variant="bordered" as={Link2} href={"/quote-boost/"+encodeURIComponent(post.uri)}>
              <span className="icon" aria-label="Quote Boosts"><span className="quoteboost-boost-icon"><FontAwesomeIcon icon={icons.repeat} size="2xs" /></span><span className="quoteboost-comment-icon"><FontAwesomeIcon icon={icons.comment} /></span></span> {" "}
              <span className="total">{numQuoteBoosts}</span>
            </Button>
          :
          <div className="stat">
            <span className="icon" aria-label="Quote Boosts"><span className="quoteboost-boost-icon"><FontAwesomeIcon icon={icons.repeat} size="2xs" /></span><span className="quoteboost-comment-icon"><FontAwesomeIcon icon={icons.comment} /></span></span> {" "}
            <span className="total">{numQuoteBoosts}</span>
          </div>
        }
      </li>
    </ul>
    </>
  );
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
