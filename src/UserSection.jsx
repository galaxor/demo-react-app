import { useContext } from 'react';
import { UserContext } from './UserContext.jsx';
import { Link } from 'react-router-dom';

import { User } from './logic/user.js';

export default function UserSection() {
  const {user, setUser} = useContext(UserContext);

  return (
    <section id="user-section">
      <ul>
      {user ? 
        <>
        <li id="notifications" aria-label="No new notifications">
          <input id="notifications-checkbox" type="checkbox" />
          <label htmlFor="notifications-checkbox">🔔</label>
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
