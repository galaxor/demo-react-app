import { useContext } from 'react';

import FollowInfoContext from './FollowInfoContext.jsx';
import PersonContext from './PersonContext.jsx';
import PersonInline from './PersonInline.jsx';

export default function WhoFollowsThem() {
  const person = useContext(PersonContext);
  const { whoFollowsThem } = useContext(FollowInfoContext);

  return (
    <section aria-labelledby="who-follows-them">
      <h2 id="who-follows-them">
        {whoFollowsThem.length === 1 ?
          <> {whoFollowsThem.length} person follows <bdi>{person.displayName}</bdi> </>
          :
          <> {whoFollowsThem.length} people follow <bdi>{person.displayName}</bdi> </>
        }
      </h2>

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
