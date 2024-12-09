import {Avatar, AvatarGroup, AvatarIcon} from "@nextui-org/avatar";
import { Button } from "@nextui-org/button"
import hashSum from 'hash-sum'
import { useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Link as Link2 } from "@nextui-org/link"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import DarkModeSwitcher from './DarkModeSwitcher.jsx'
import icons from './icons.js'
import NotificationBell from './NotificationBell.jsx';
import User from './logic/user.js';
import UserContext from './UserContext.jsx';

export default function UserSection({darkMode, setDarkMode}) {
  const {user, setUser, setSessionId} = useContext(UserContext);

  const avatarFallbackColor = user? hashSum(user.handle).substring(0,6).toUpperCase() : "000000";

  return (
    <section id="user-section">
      <ul className="flex item-center">
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
        <li>
          <Button onPress={() => { setSessionId(User.login()); setUser(User.loggedInUser()); }}
            as={Link2} radius="full" color="primary" variant="solid"
            startContent={<FontAwesomeIcon icon={icons.doorOpen} />}
          >
            Log In
          </Button>
        </li>
      }
      <li id="dark-mode-switcher" className="ml-[110px]">
        <DarkModeSwitcher darkMode={darkMode} setDarkMode={setDarkMode} />
      </li>
      </ul>
    </section>
  );
}
