import { useContext } from 'react';
import DatabaseContext from './DatabaseContext.jsx';
import { PeopleDB } from './logic/people.js';
import PersonInline from './PersonInline.jsx';

export default function WhoFollowsThem({person}) {
  const db = useContext(DatabaseContext);
  const peopleDB = new PeopleDB(db);
  const whoFollowsThem = peopleDB.whoFollowsThem(person.handle);

  return (
    <section aria-labelledby="who-follows-them">
      <h2 id="who-follows-them">Who follows <bdi>{person.displayName}</bdi>?</h2>

      {whoFollowsThem.length > 0 ?
        <ul aria-labelledby="who-follows-them">
        {whoFollowsThem.map(personWhoFollows => {
          return (<li key={personWhoFollows.handle}><PersonInline person={personWhoFollows} /></li>);
          }
        )}
        </ul>
        :
        <div>No one follows <bdi>{person.displayName}</bdi>.</div>
      }
    </section>
  );
}
