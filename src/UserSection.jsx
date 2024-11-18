import { useContext } from 'react';
import { UserContext } from './UserContext.jsx';
import { Link } from 'react-router-dom';
import NotificationBell from './NotificationBell.jsx';

import { User } from './logic/user.js';

export default function UserSection() {
  const {user, setUser} = useContext(UserContext);

  return (
    <section id="user-section">
      <ul>
      {user ?
        <>
        <li id="notification-bell">
          <NotificationBell />
        </li>
        <li id="user-name">{user.name}</li>
        </>
        :
        <li id="login"><Link onClick={() => setUser(User.login())}>Log In</Link></li>
      }
      </ul>
    </section>
  );
}
