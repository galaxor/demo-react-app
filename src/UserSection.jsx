import { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';

import UserContext from './UserContext.jsx';
import NotificationBell from './NotificationBell.jsx';

import User from './logic/user.js';

export default function UserSection() {
  const {user, setUser, setSessionId} = useContext(UserContext);

  return (
    <section id="user-section">
      <ul>
      {user ?
        <>
        <li id="notification-bell">
          <NotificationBell />
        </li>
        <li id="user-name"><NavLink to="/profile">{user.avatar? 
          <img src={user.avatar} className="avatar-small" alt={user.avatarAltText} />
          :
          ""}
          {user.displayName}
        </NavLink></li>
        </>
        :
        <li><Link onClick={(e) => { e.preventDefault(); setSessionId(User.login()); setUser(User.loggedInUser()); }}>Log In</Link></li>
      }
      </ul>
    </section>
  );
}
