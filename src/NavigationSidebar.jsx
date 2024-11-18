import { useContext } from 'react';
import { UserContext } from './UserContext';
import { Link } from 'react-router-dom';

import { User } from './logic/user.js';

export default function NavigationSidebar() {
  const { user, setUser } = useContext(UserContext);

  console.log(User);
  
  return (
    <aside id="site-navigation">
      <nav id="site-navigation">
      <section>
      <h2 id="available-feeds">Available Feeds</h2>
      <ul aria-describedby="available-feeds">
        <li>Featured Feed</li>
      </ul>
      </section>

      <section>
      {user ?
        <>
        <h2 id="account">Account</h2>
        <ul aria-describedby="account">
        <li>Profile</li>
        <li>Account Settings</li>
        <li><Link onClick={() => setUser(User.logout())}>Log Out</Link></li>
        </ul>
        </>

        :

        <>
        <h2 id="join-the-site">Join</h2>
        <ul aria-describedby="join-the-site">
          <li>Create Account</li>
          <li><Link onClick={() => setUser(User.login())}>Log In</Link></li>
        </ul>
        </>

      }
      </section>
      </nav>
    </aside>
  );
}
