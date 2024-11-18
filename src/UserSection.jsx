import { useContext, useState } from 'react';
import { UserContext } from './UserContext.jsx';
import { Link } from 'react-router-dom';
import { Notifications } from './Notifications.jsx';

import { User } from './logic/user.js';

export default function UserSection() {
  const {user, setUser} = useContext(UserContext);
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  return (
    <section id="user-section">
      <ul>
      {user ? 
        <>
        <li id="notifications" aria-label="No new notifications">
          <input id="notifications-checkbox" type="checkbox" checked={notificationsVisible}
            onChange={(e) => {
              setNotificationsVisible(e.target.checked);
             }}
          />
          <label htmlFor="notifications-checkbox">🔔</label>
          {notificationsVisible ? 
            <Notifications
                setNotificationsVisible={setNotificationsVisible}
            />
            :
            ''
          }
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
