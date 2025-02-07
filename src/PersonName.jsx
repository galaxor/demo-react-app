import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useContext } from 'react'
import { Link } from 'react-router-dom'

import DatabaseContext from './DatabaseContext.jsx';
import icons from './icons.js'
import UserContext from './UserContext.jsx';
import { PeopleDB } from './logic/people.js';

export default function PersonName({person, link}) {
  const { user } = useContext(UserContext);
  const db = useContext(DatabaseContext);
  const peopleDB = new PeopleDB(db);

  const isYou = (user && user.handle === person.handle);
  const youFollowThem = (user === null || isYou)? false : peopleDB.doesXFollowY(user.handle, person.handle);
  const onHomeServer = (person.localUserId !== null); 

  const personName = (
    <span className="person-name">
      <bdi>{person.displayName}</bdi> 

      <span className="person-inline-trust-info">
        {isYou && <span className="is-you mx-1">(You)</span>} {" "}
        {onHomeServer && <span className="trust-on-this-server">
            <FontAwesomeIcon title="From this server" icon={icons.house} />
          </span>
        } {" "}
        {youFollowThem && <span className="trust-you-follow-them" aria-label="You follow them">
            <FontAwesomeIcon title="You follow them" icon={icons.flag} />
          </span>
        }
      </span>
    </span>
  );

  return link? <Link className="person-name" to={"/people/"+person.handle}>{personName}</Link> : personName;
}
