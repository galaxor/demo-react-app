export default function ProfileBio({person}) {
  return (
    <>
    <h2>Bio</h2>
    
    <div className="profile-bio">
      {person.bio}
    </div>
    </>
  );
}
