import PersonInline from './PersonInline.jsx';

export default function WhoFollowsThem({person, whoDoTheyFollow}) {

  return (
    <section aria-labelledby="who-do-they-follow">
      <h2 id="who-do-they-follow">
        {whoDoTheyFollow.length === 1 ?
          <> <bdi>{person.displayName}</bdi> follows {whoDoTheyFollow.length} person </>
          :
          <> <bdi>{person.displayName}</bdi> follows {whoDoTheyFollow.length} people </>
        }
      </h2>

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

