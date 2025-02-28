import { useContext, useEffect, useState } from 'react';
import {Switch} from "@nextui-org/react";

import PersonContext from './PersonContext.jsx';
import DatabaseContext from './DatabaseContext.jsx';
import { PeopleDB } from './logic/people.js';
import UserContext from './UserContext.jsx';

import './static/FriendStatus.css'
import switchStyles from './fancy-switch-styles.js'

export default function FriendStatus({person}) {
  const { user } = useContext(UserContext);
  const db = useContext(DatabaseContext);

  const peopleDB = new PeopleDB(db);

  const { youFollowThem, setYouFollowThem } = useContext(PersonContext);
  const [theyFollowYou, setTheyFollowYou] = useState(false);

  useEffect(() => {
    (async () => {
      if (user) {
        setTheyFollowYou(await peopleDB.doesXFollowY(person.handle, user.handle));
      }
    })();
  }, [user]);

  return (
    <section className="follow-status" aria-labelledby="follow-status">
      <h2 id="follow-status" className="visually-hidden">Follow Status</h2>

      <ul className="follow-status" aria-labelledby="follow-status">
        <li>
        <Switch 
          isSelected={
            typeof youFollowThem === "undefined"? 
              (user && peopleDB.doesXFollowY(user.handle, person.handle)) 
              : youFollowThem
          }

          onValueChange={async checked => {
            if (checked) { await peopleDB.follow(user.handle, person.handle); }
            else { await peopleDB.unfollow(user.handle, person.handle); }

            setYouFollowThem(checked);
          }}

          classNames={switchStyles}
        >
            {youFollowThem?
              <> You follow <bdi>{person.displayName}</bdi> </>
              :
              <> Follow <bdi>{person.displayName}</bdi> </>
            }
          </Switch>
        </li>

        <li>
          <Switch isDisabled={true} isSelected={theyFollowYou} classNames={switchStyles}>
            {theyFollowYou ?
              <>
              <bdi>{person.displayName}</bdi> follows you 
              </>
              :
              <>
              <bdi>{person.displayName}</bdi> does not follow you 
              </>
            }
          </Switch>
        </li>
      </ul>
    </section>
  );
}
