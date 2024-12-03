import { useContext, useState } from 'react';

import DatabaseContext from './DatabaseContext.jsx';
import { PeopleDB } from './logic/people.js';
import UserContext from './UserContext.jsx';

import './static/FriendStatus.css'

export default function FriendStatus({person}) {
  const { user } = useContext(UserContext);
  const db = useContext(DatabaseContext);

  const peopleDB = new PeopleDB(db);

  const [youFollowThem, setYouFollowThem] = useState();
  const theyFollowYou = user? peopleDB.doesXFollowY(person.handle, user.handle) : null;

  return (
    <section className="follow-status" aria-labelledby="follow-status">
      <h2 id="follow-status" className="visually-hidden">Follow Status</h2>

      <ul className="follow-status" aria-labelledby="follow-status">
        <li><label className="checkbutton">
          {(typeof youFollowThem === "undefined"? 
                (user && peopleDB.doesXFollowY(user.handle, person.handle)) 
                : youFollowThem)
            ?
            <> You follow <bdi>{person.displayName}</bdi> </>
            :
            <> Follow <bdi>{person.displayName}</bdi> </>
          }

          <input type="checkbox" 
            checked={ 
              typeof youFollowThem === "undefined"? 
                (user && peopleDB.doesXFollowY(user.handle, person.handle)) 
                : youFollowThem
            }

            onChange={(e) => {
              if (e.target.checked) { peopleDB.follow(user.handle, person.handle); }
              else { peopleDB.unfollow(user.handle, person.handle); }

              setYouFollowThem(e.target.checked);
            }} />
        </label></li>

        <li><label className="checkbutton">
          {theyFollowYou ?
            <>
            <bdi>{person.displayName}</bdi> follows you 
              <input type="checkbox" disabled={true} checked={true} />
            </>
            :
            <>
            <bdi>{person.displayName}</bdi> does not follow you 
              <input type="checkbox" disabled={true} checked={false} />
            </>
          }
        </label></li>
      </ul>
    </section>
  );
}
