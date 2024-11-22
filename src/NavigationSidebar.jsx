import { useContext } from 'react';
import UserContext from './UserContext';
import { Link, NavLink, useMatches } from 'react-router-dom';

import User from './logic/user.js';

import './static/nav.css';

export default function NavigationSidebar() {
  const { user, setUser, sessionId, setSessionId } = useContext(UserContext);

  const matches = useMatches();

  return (
    <aside id="site-navigation">
      <nav id="site-navigation">
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
      {user ?
        <>
        <h2 id="account">Account</h2>
        <ul aria-describedby="account">
        <li><NavLink to="/profile">Profile</NavLink></li>
        <li>Account Settings</li>
        <li><Link onClick={() => setSessionId(User.logout())}>Log Out</Link></li>
        </ul>
        </>

        :

        <>
        <h2 id="join-the-site">Join</h2>
        <ul aria-describedby="join-the-site">
          <li>Create Account</li>
          <li><Link onClick={() => setSessionId(User.login())}>Log In</Link></li>
        </ul>
        </>

      }
      </section>
      </nav>
    </aside>
  );
}
