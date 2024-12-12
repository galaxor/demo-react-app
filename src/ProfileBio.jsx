import { useContext } from 'react';

import PersonContext from './PersonContext.jsx';

export default function ProfileBio() {
  const { person } = useContext(PersonContext);

  return (
    <>
    <h2 className="text-2xl font-bold my-4">Bio</h2>
    
    <div className="profile-bio p-note whitespace-pre-line">
      {person.bio}
    </div>
    </>
  );
}
