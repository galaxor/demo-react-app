import Logo from './Logo.jsx';
import UserSection from './UserSection.jsx';
import NavigationSidebar from './NavigationSidebar.jsx';

import './App.css';
import { UserContext } from "./UserContext.jsx";
import { useEffect, useState } from 'react';

import User from './logic/user.js';

import { Outlet } from "react-router-dom";

function App() {
  const [user, setUser] = useState(null);
  const userContext = {user: user, setUser: setUser};

  useEffect(() => {
    if (user == null) {
      const loggedInUser = User.loggedInUser();
      setUser(loggedInUser);
    }
  }, [user, setUser]);

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
