import { useContext } from 'react';

import FollowInfoContext from './FollowInfoContext.jsx';
import PersonContext from './PersonContext.jsx';
import PersonInline from './PersonInline.jsx';

export default function WhoFollowsThem() {
  const person = useContext(PersonContext);
  const { whoFollowsThem } = useContext(FollowInfoContext);

  return (
    <section aria-labelledby="who-follows-them">
      <h2 id="who-follows-them" className="text-2xl font-bold my-4">
        {Object.values(whoFollowsThem).length === 1 ?
          <> {Object.values(whoFollowsThem).length} person follows <bdi>{person.displayName}</bdi> </>
          :
          <> {Object.values(whoFollowsThem).length} people follow <bdi>{person.displayName}</bdi> </>
        }
      </h2>

      {whoFollowsThem.length > 0 ?
        <ul className="who-follows-them" aria-labelledby="who-follows-them">
        {Object.values(whoFollowsThem).map(personWhoFollows => {
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
