import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import DatabaseContext from './DatabaseContext.jsx';
import icons from './icons.js'
import UserContext from './UserContext.jsx';
import { PeopleDB } from './logic/people.js';

export default function PersonName({person, link}) {
  const { user } = useContext(UserContext);
  const db = useContext(DatabaseContext);
  const peopleDB = new PeopleDB(db);

  const [isYou, setIsYou] = useState(false);
  const [youFollowThem, setYouFollowThem] = useState(false);

  useEffect(() => {
    (async () => {
      const isYou = (user && user.handle === person.handle);

      setIsYou(isYou);
      setYouFollowThem((user === null || isYou)? false : await peopleDB.doesXFollowY(user.handle, person.handle));
    })();
  }, [user]);

  const onHomeServer = (person.localUserId !== null); 

  const personName = (
    <span className="person-name">
      <bdi>{person.displayName}</bdi> 

      <span className="person-inline-trust-info">
        {isYou && <span className="mx-1 is-you">(You)</span>} {" "}
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
