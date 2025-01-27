import { useEffect, useState } from 'react';
import { Outlet } from "react-router-dom";

import Logo from './Logo.jsx';
import UserSection from './UserSection.jsx';
import NavigationSidebar from './NavigationSidebar.jsx';

import SystemNotificationsContext from "./SystemNotificationsContext.jsx";

import DatabaseContext from "./DatabaseContext.jsx";
import DarkModeContext from "./DarkModeContext.jsx";
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

  const localStorageDarkMode = JSON.parse(localStorage.getItem('darkMode'));

  const [ darkMode, setDarkMode ] = useState(
    // For the initial value:
    // First, check the user prefs:
    user? user.darkMode :
      // Then check localStorage
      typeof localStorageDarkMode !== "undefined"? localStorageDarkMode :
      // Then check OS pref.
      matchMedia('(prefers-color-scheme: dark)').matches
  );

  // Keep dark mode in sync with the user, in case they log in or out.
  useEffect(() => {
    setDarkMode(
      // First, check the user prefs:
      user? user.darkMode :
        // Then check localStorage
        typeof localStorageDarkMode !== "undefined"? localStorageDarkMode :
        // Then check OS pref.
        matchMedia('(prefers-color-scheme: dark)').matches
    );
    
  }, [user, setDarkMode]);

  return (
    <>
    <DatabaseContext.Provider value={db}>
    <UserContext.Provider value={userContext}>
    <DarkModeContext.Provider value={[darkMode, setDarkMode]}>
    <LanguageContext.Provider value={languageContext}>
    <SystemNotificationsContext.Provider value={systemNotificationsContext}>
    <div className={"app-theme text-foreground bg-background " + (darkMode? "dark " : "")}>
      <header className="page-header shadow-md">
        <Logo />
        <UserSection darkMode={darkMode} setDarkMode={setDarkMode} />
      </header>

      <div id="page-body">
        <NavigationSidebar />
        <Outlet />
      </div>
    </div>
    </SystemNotificationsContext.Provider>
    </LanguageContext.Provider>
    </DarkModeContext.Provider>
    </UserContext.Provider>
    </DatabaseContext.Provider>
    </>
  );
}

export default App;
