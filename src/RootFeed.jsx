import { useContext } from 'react';

import UserContext from './UserContext.jsx';
import PopularFeed from './PopularFeed.jsx';
import YourFeed from './YourFeed.jsx';

export default function RootFeed() {
  const { user } = useContext(UserContext);

  return user ?
    <YourFeed />
    : <PopularFeed />
  ;
}
