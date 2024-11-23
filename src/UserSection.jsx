import { useContext } from 'react';
import { Link } from 'react-router-dom';

import UserContext from './UserContext.jsx';
import NotificationBell from './NotificationBell.jsx';

import User from './logic/user.js';

export default function UserSection() {
  const {user, setSessionId} = useContext(UserContext);

  return (
    <section id="user-section">
      <ul>
      {user ?
        <>
        <li id="notification-bell">
          <NotificationBell />
        </li>
        <li id="user-name">{user.avatar? 
          <img src={user.avatar} className="avatar-small" alt={user.avatarAltText} />
          :
          ""}
          {user.displayName}
        </li>
        </>
        :
        <li><Link onClick={(e) => { e.preventDefault(); setSessionId(User.login()); }}>Log In</Link></li>
      }
      </ul>
    </section>
  );
}
