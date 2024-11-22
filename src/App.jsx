import { useEffect, useState } from 'react';
import { Outlet } from "react-router-dom";

import Logo from './Logo.jsx';
import UserSection from './UserSection.jsx';
import NavigationSidebar from './NavigationSidebar.jsx';

import SystemNotificationsContext from "./SystemNotificationsContext.jsx";
import UserContext from "./UserContext.jsx";
import LanguageContext from "./LanguageContext.jsx";
import DatabaseContext from "./DatabaseContext.jsx";

import './App.css';
import User from './logic/user.js';

import Database from './logic/database.js'

import TimeAgo from 'javascript-time-ago'
// XXX We have to manually do this for every language we support.
import en from 'javascript-time-ago/locale/en'



const timeAgoLocales = {
  en: en
};
for (var lang in timeAgoLocales) {
  TimeAgo.addLocale(timeAgoLocales[lang]);
}

const navigatorLanguage = navigator.language.split('-')[0];
if (typeof timeAgoLocales[lang] === "undefined") {
  TimeAgo.addDefaultLocale(timeAgoLocales['en']);
} else {
  TimeAgo.addDefaultLocale(timeAgoLocales[navigatorLanguage]);
}

function App() {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);

  const [systemNotifications, setSystemNotifications] = useState([]);
  const systemNotificationsContext = {systemNotifications: systemNotifications, setSystemNotifications: setSystemNotifications};

  const [sessionId, setSessionId] = useState(null);

  const userContext = {user: user, setUser: setUser, sessionId: sessionId, setSessionId: setSessionId};

  // TODO: Add i18n support 🤪
  const languageContext = navigator.language;

  useEffect(() => {
    const loggedInUser = User.loggedInUser();
    setUser(loggedInUser);
  }, [sessionId, setUser]);

  const databaseContext = new Database();

  return (
    <>
    <DatabaseContext.Provider value={databaseContext}>
    <UserContext.Provider value={userContext}>
    <LanguageContext.Provider value={languageContext}>
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
    </LanguageContext.Provider>
    </UserContext.Provider>
    </DatabaseContext.Provider>
    </>
  );
}

export default App;
