import { Button } from "@nextui-org/button"
import { useContext, useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Link as Link2 } from "@nextui-org/link"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import Avatar from './components/Avatar.jsx'
import DarkModeSwitcher from './DarkModeSwitcher.jsx'
import icons from './icons.js'
import MastodonAPIContext from './context/MastodonAPIContext.jsx';
import NotificationBell from './NotificationBell.jsx';
import UserContext from './UserContext.jsx';

export default function UserSection({darkMode, setDarkMode}) {
  const {user, setUser, setSessionId, userDB, serverUrl, setServerUrl} = useContext(UserContext);
  const mastodonApi = useContext(MastodonAPIContext);

  const [loginUrl, setLoginUrl] = useState();

  useEffect(() => {
    (async () => {
      if (!user && !loginUrl) {
        await mastodonApi.ready();
        setLoginUrl(await mastodonApi.loginUrl(window.location));
      }
    })();
  }, [serverUrl]);

  return (
    <section id="user-section">
      <ul className="flex item-center">
      {user ?
        <>
        <li id="notification-bell">
          <NotificationBell />
        </li>
        <li id="user-name"><NavLink to="/profile">{user.avatar? 
          <Avatar person={user} />
          :
          ""}
        </NavLink></li>
        </>
        :
        serverUrl && loginUrl? 
          <li>
            <Button onPress={async () => { setSessionId(await userDB.login()); setUser(await userDB.loggedInUser()); }}
              as={Link2} href={loginUrl} radius="full" color="primary" variant="solid"
              startContent={<FontAwesomeIcon icon={icons.doorOpen} />}
            >
              Log In
            </Button>
          </li>
          : ""
      }
      <li id="dark-mode-switcher" className="ml-[110px]">
        <DarkModeSwitcher darkMode={darkMode} setDarkMode={setDarkMode} />
      </li>
      </ul>
    </section>
  );
}
