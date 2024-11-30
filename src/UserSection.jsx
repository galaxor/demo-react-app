import { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import icons from './icons.js'
import NotificationBell from './NotificationBell.jsx';
import User from './logic/user.js';
import UserContext from './UserContext.jsx';

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
          <img src={user.avatar} className="avatar-small" alt={user.displayName} />
          :
          ""}
        </NavLink></li>
        </>
        :
        <li><div className="button site-button" id="login-link"><Link onClick={(e) => { e.preventDefault(); setSessionId(User.login()); setUser(User.loggedInUser()); }}><FontAwesomeIcon icon={icons.doorOpen} />Log In</Link></div></li>
      }
      </ul>
    </section>
  );
}
