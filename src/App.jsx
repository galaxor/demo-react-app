import Logo from './Logo.jsx';
import UserSection from './UserSection.jsx';
import NavigationSidebar from './NavigationSidebar.jsx';
import FeaturedFeed from './FeaturedFeed.jsx';

import './App.css';
import { UserContext } from "./UserContext.jsx";
import { useState } from 'react';

import { Outlet } from "react-router-dom";

function App() {
  const [user, setUser] = useState(null);
  const userContext = {user: user, setUser: setUser};

  return (
    <>
    <UserContext.Provider value={userContext}>
    <header>
      <Logo />
      <UserSection />
    </header>

    <NavigationSidebar />
    <Outlet />
    </UserContext.Provider>
    </>
  );
}

export default App;
