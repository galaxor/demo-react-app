import { useContext, useState } from 'react'
import { Link } from 'react-router-dom'

import DatabaseContext from './DatabaseContext.jsx'
import { PostsDB } from './logic/posts.js';
import UserContext from './UserContext.jsx';

export default function Boosts({post}) {
  const { user } = useContext(UserContext);
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

  const [numBoosts, setNumBoosts] = useState(postsDB.getNumberOfBoostsOf(post.uri));
  const [numYourBoosts, setNumYourBoosts] = useState(user? postsDB.getNumberOfBoostsOf(post.uri, {by: user.handle}) : 0);

  const [numQuoteBoosts, setNumQuoteBoosts] = useState(postsDB.getNumberOfQuoteBoostsOf(post.uri));
  const [numYourQuoteBoosts, setNumYourQuoteBoosts] = useState(user? postsDB.getNumberOfQuoteBoostsOf(post.uri, {by: user.handle}) : 0);

  const htmlId = encodeURIComponent(post.uri)+'-boosts';

  return (
    <>
    <span id={htmlId} className="boosts-header">
      Boosts
    </span>
    <ul aria-labelledby={htmlId}>
      <li className={'non-quote-boosts ' + ((numYourBoosts > 0) && 'you-did-this')}>
        {user? 
          <Link to="/" onClick={e => { e.preventDefault(); clickBoosts({user, post, postsDB, numBoosts, setNumBoosts, numYourBoosts, setNumYourBoosts})}}>
            <span className="icon" aria-label="Boosts">♻</span>
            <span className="total">{numBoosts}</span>
          </Link>
          :
          <div>
            <span className="icon" aria-label="Boosts">♻</span>
            <span className="total">{numBoosts}</span>
          </div>
        }
          
      </li>

      <li className={'quote-boosts ' + ((numYourQuoteBoosts > 0) && 'you-did-this')}>
        {user?
          <Link to={"/quote-boost/"+encodeURIComponent(post.uri)}>
            <span className="icon" aria-label="Quote Boosts">♻💬</span>
            <span className="total">{numQuoteBoosts}</span>
          </Link>
          :
          <div>
            <span className="icon" aria-label="Quote Boosts">♻💬</span>
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
