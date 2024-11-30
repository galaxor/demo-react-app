import { useContext } from 'react';
import { Link, NavLink, useMatches } from 'react-router-dom';

import User from './logic/user.js';
import UserContext from './UserContext';

export default function LogoutLink({}) {
  const { user, setUser, setSessionId } = useContext(UserContext);

  return (
    <Link onClick={() => { setSessionId(User.logout()); setUser(null); }} to="/">Log Out</Link>
  );

}
