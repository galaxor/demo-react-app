import { useEffect, useState } from 'react';
import { Outlet } from "react-router-dom";

import Logo from './Logo.jsx';
import UserSection from './UserSection.jsx';
import NavigationSidebar from './NavigationSidebar.jsx';
import SystemNotificationArea from './SystemNotificationArea.jsx';

import SystemNotificationsContext from "./SystemNotificationsContext.jsx";
import UserContext from "./UserContext.jsx";

import './App.css';
import User from './logic/user.js';

function App() {
  const [user, setUser] = useState(null);
  const userContext = {user: user, setUser: setUser};

  const [systemNotifications, setSystemNotifications] = useState([]);
  const systemNotificationsContext = {systemNotifications: systemNotifications, setSystemNotifications: setSystemNotifications};

  useEffect(() => {
    if (user == null) {
      const loggedInUser = User.loggedInUser();
      setUser(loggedInUser);
    }
  }, [user, setUser]);

  return (
    <>
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
    </>
  );
}

export default App;
