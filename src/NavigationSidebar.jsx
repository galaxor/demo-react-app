import { useContext } from 'react';
import UserContext from './UserContext';
import { Link, NavLink, useMatches } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import icons from './icons.js'
import LogoutLink from './LogoutLink.jsx'
import User from './logic/user.js';

import './static/nav.css';

export default function NavigationSidebar() {
  const { user, setUser, setSessionId } = useContext(UserContext);

  const matches = useMatches();

  return (
    <aside id="site-navigation">
      <nav id="site-navigation">

      {user && <h2 id="create-a-post" className="button site-button"><NavLink to="/create">
        <FontAwesomeIcon icon={icons.penToSquare} />
        Create
      </NavLink></h2>
      }

      <section>
      <h2 id="available-feeds">Available Feeds</h2>
      <ul aria-describedby="available-feeds">
        {user ?
          <li><NavLink className={(user && matches[matches.length-1].pathname=="/") ? 'active' : ''} to="/home">Your Feed</NavLink></li>
          : ''
        }
        <li><NavLink className={(!user && matches[matches.length-1].pathname=="/") ? 'active' : ''} to="/popular">Popular Posts</NavLink></li>
      </ul>
      </section>

      <section>
      {user ?  "" :
        <>
        <h2 id="join-the-site">Join</h2>
        <ul aria-describedby="join-the-site">
          <li>Create Account</li>
          <li><Link onClick={(e) => { e.preventDefault(); setSessionId(User.login()); setUser(User.loggedInUser()); }}>Log In</Link></li>
        </ul>
        </>

      }
      </section>
      </nav>
    </aside>
  );
}
