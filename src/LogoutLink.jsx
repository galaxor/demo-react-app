import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useContext } from 'react';
import { Link, NavLink, useMatches } from 'react-router-dom';

import icons from './icons.js'
import User from './logic/user.js';
import UserContext from './UserContext';

export default function LogoutLink({}) {
  const { user, setUser, setSessionId } = useContext(UserContext);

  return (
    <span className="button logout-button"><Link className="logout" onClick={() => { setSessionId(User.logout()); setUser(null); }} to="/"><FontAwesomeIcon icon={icons.doorClosed} />{" "}Log Out</Link></span>
  );

}
