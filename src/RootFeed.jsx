import { useContext } from 'react';
import { User } from './logic/user.js';
import { UserContext } from './UserContext.jsx';
import PopularFeed from './PopularFeed.jsx';
import YourFeed from './YourFeed.jsx';

export default function RootFeed() {
  const { user, setUser } = useContext(UserContext);

  return user ?
    <YourFeed />
    : <PopularFeed />
  ;
}
