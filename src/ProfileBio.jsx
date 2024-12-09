import { useContext } from 'react';

import PersonContext from './PersonContext.jsx';

export default function ProfileBio() {
  const person = useContext(PersonContext);

  return (
    <>
    <h2>Bio</h2>
    
    <div className="profile-bio p-note">
      {person.bio}
    </div>
    </>
  );
}
