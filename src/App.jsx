import { useState } from 'react';
import { Outlet } from "react-router-dom";

import Logo from './Logo.jsx';
import UserSection from './UserSection.jsx';
import NavigationSidebar from './NavigationSidebar.jsx';

import SystemNotificationsContext from "./SystemNotificationsContext.jsx";

import DatabaseContext from "./DatabaseContext.jsx";
import LanguageContext from "./LanguageContext.jsx";
import UserContext from "./UserContext.jsx";

import './App.css';
import User from './logic/user.js';

function App({db}) {
  const [user, setUser] = useState(User.loggedInUser());

  const [systemNotifications, setSystemNotifications] = useState([]);
  const systemNotificationsContext = {systemNotifications: systemNotifications, setSystemNotifications: setSystemNotifications};

  const [sessionId, setSessionId] = useState(null);

  const userContext = {user, setUser, sessionId, setSessionId};

  // TODO: Add i18n support 🤪
  // Anybody can read navigator.language.
  // But the idea is one day this could be a state value that you can change with a drop down.
  const languageContext = navigator.language;

  return (
    <>
    <DatabaseContext.Provider value={db}>
    <UserContext.Provider value={userContext}>
    <LanguageContext.Provider value={languageContext}>
    <SystemNotificationsContext.Provider value={systemNotificationsContext}>
    <div className="text-foreground bg-background">
      <header>
        <Logo />
        <UserSection />
      </header>

      <div id="page-body">
        <NavigationSidebar />
        <Outlet />
      </div>
    </div>
    </SystemNotificationsContext.Provider>
    </LanguageContext.Provider>
    </UserContext.Provider>
    </DatabaseContext.Provider>
    </>
  );
}

export default App;
