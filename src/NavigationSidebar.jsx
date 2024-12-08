import { Button } from "@nextui-org/button"
import { useContext } from 'react';
import UserContext from './UserContext';
import { Link, NavLink, useMatches } from 'react-router-dom';
import { Link as Link2 } from "@nextui-org/link"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import icons from './icons.js'
import LogoutLink from './LogoutLink.jsx'
import User from './logic/user.js';

import './static/nav.css';

export default function NavigationSidebar() {
  const { user, setUser, setSessionId } = useContext(UserContext);

  const matches = useMatches();

  return (
    <aside id="site-navigation">
      <nav id="available-feeds">

      {user && <h2 id="create-a-post" className="button site-button">
        <Button as={Link2} color="primary" radius="full" href="/create" variant="solid"
          startContent={<FontAwesomeIcon icon={icons.penToSquare} />}
        >
          Create
        </Button>
      </h2>
      }

      <section>
      <h2 id="available-feeds" className="visually-hidden">Available Feeds</h2>
      <ul aria-describedby="available-feeds">
        {user ?
          <li><NavLink className={(user && matches[matches.length-1].pathname=="/") ? 'active' : ''} to="/home">
            <FontAwesomeIcon icon={icons.house} />
            Your Feed
          </NavLink></li>
          : ''
        }
        <li><NavLink className={(!user && matches[matches.length-1].pathname=="/") ? 'active' : ''} to="/popular">
          <FontAwesomeIcon icon={icons.earthAmericas} />
          All Posts
        </NavLink></li>
      </ul>
      </section>
      </nav>
    </aside>
  );
}
