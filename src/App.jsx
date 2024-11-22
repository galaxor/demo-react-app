import { useEffect, useState } from 'react';
import { Outlet } from "react-router-dom";

import Logo from './Logo.jsx';
import UserSection from './UserSection.jsx';
import NavigationSidebar from './NavigationSidebar.jsx';

import SystemNotificationsContext from "./SystemNotificationsContext.jsx";
import UserContext from "./UserContext.jsx";
import DatabaseContext from "./DatabaseContext.jsx";

import './App.css';
import User from './logic/user.js';

import Database from './logic/database.js'

function App() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);

  const [systemNotifications, setSystemNotifications] = useState([]);
  const systemNotificationsContext = {systemNotifications: systemNotifications, setSystemNotifications: setSystemNotifications};

  const [sessionId, setSessionId] = useState(null);

  const userContext = {user: user, setUser: setUser, sessionId: sessionId, setSessionId: setSessionId};

  useEffect(() => {
    if (sessionId != null) {
      const loggedInUser = User.loggedInUser();
      setUser(loggedInUser);
    }
  }, [sessionId, setUser]);

  const databaseContext = new Database();

  return (
    <>
    <DatabaseContext.Provider value={databaseContext}>
    <UserContext.Provider value={userContext}>
    <SystemNotificationsContext.Provider value={systemNotificationsContext}>
    <header>
      <Logo />
      <UserSection />
    </header>

    <NavigationSidebar />
    <main>
    <Outlet />
    </main>
    </SystemNotificationsContext.Provider>
    </UserContext.Provider>
    </DatabaseContext.Provider>
    </>
  );
}

export default App;
