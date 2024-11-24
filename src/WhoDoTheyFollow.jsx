import { useContext } from 'react';
import DatabaseContext from './DatabaseContext.jsx';
import { PeopleDB } from './logic/people.js';
import PersonInline from './PersonInline.jsx';

export default function WhoFollowsThem({person}) {
  const db = useContext(DatabaseContext);
  const peopleDB = new PeopleDB(db);
  const whoDoTheyFollow = peopleDB.whoDoTheyFollow(person.handle);

  return (
    <section aria-labelledby="who-do-they-follow">
      <h2 id="who-do-they-follow">Who does <bdi>{person.displayName}</bdi> follow?</h2>

      {whoDoTheyFollow.length > 0 ?
        <ul aria-labelledby="who-do-they-follow">
        {whoDoTheyFollow.map(personWhoIsFollowed => {
          return (<li key={personWhoIsFollowed.handle}><PersonInline person={personWhoIsFollowed} /></li>);
          }
        )}
        </ul>
        :
        <div><bdi>{person.displayName}</bdi> does not follow anyone.</div>
      }
    </section>
  );
}

