import {Avatar, AvatarGroup, AvatarIcon} from "@nextui-org/avatar";
import hashSum from 'hash-sum'
import { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import icons from './icons.js'
import NotificationBell from './NotificationBell.jsx';
import User from './logic/user.js';
import UserContext from './UserContext.jsx';

export default function UserSection() {
  const {user, setUser, setSessionId} = useContext(UserContext);

  const avatarFallbackColor = hashSum(user.handle).substring(0,6).toUpperCase();

  return (
    <section id="user-section">
      <ul>
      {user ?
        <>
        <li id="notification-bell">
          <NotificationBell />
        </li>
        <li id="user-name"><NavLink to="/profile">{user.avatar? 
          <Avatar isBordered radius="full" size="md" className="shrink-0" src={user.avatar} name={user.displayName} 
            style={{'--avatar-bg': '#'+avatarFallbackColor}}
            classNames={{base: "bg-[--avatar-bg]"}}
          />
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
