import { useContext, useState } from 'react'

import DatabaseContext from './DatabaseContext.jsx'
import { PostsDB } from './logic/posts.js';
import UserContext from './UserContext.jsx';

export default function Boosts({post}) {
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

  const [yourReactions, setYourReactions] = useState();
  const { user } = useContext(UserContext);

  const boostsOfPost = postsDB.getBoostsOf(post.uri);

  console.log(boostsOfPost);

  const htmlId = encodeURIComponent(post.uri)+'-boosts';

  return (
    <aside className="boosts" aria-labelledby={htmlId}>
      <span id={htmlId} className="boosts-header">
        Boosts
      </span>
      <ul aria-labelledby={htmlId}>
        <li className="non-quote-boosts">
          {user? 
            <div className="Link">
              <span className="icon" aria-label="Boosts">♻</span>
              <span className="total">{boostsOfPost.length}</span>
            </div>
            :
            <div className="Not-a-link">
              <span className="icon" aria-label="Boosts">♻</span>
              <span className="total">{boostsOfPost.length}</span>
            </div>
          }
            
        </li>
      </ul>
    </aside>
  );
  
}
