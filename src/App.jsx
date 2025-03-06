import { useEffect, useState } from 'react';
import { Outlet } from "react-router-dom";

import Logo from './Logo.jsx';
import UserSection from './UserSection.jsx';
import NavigationSidebar from './NavigationSidebar.jsx';
import ServerPicker from './components/ServerPicker.jsx'
import SystemNotificationArea from './SystemNotificationArea.jsx';

import DatabaseContext from "./DatabaseContext.jsx";
import DarkModeContext from "./DarkModeContext.jsx";
import LanguageContext from "./LanguageContext.jsx";
import MastodonAPIContext from "./context/MastodonAPIContext.jsx";
import ServerContext from "./context/ServerContext.jsx";
import UserContext from "./UserContext.jsx";

import './App.css';
import UserDB from './logic/user.js';

function App({dbConnection, mastodonApi}) {
  const [db, setDB] = useState();
  const [sessionId, setSessionId] = useState(null);
  const [userDB, setUserDB] = useState();
  const [user, setUser] = useState(null);
  const [serverUrl, setServerUrl] = useState(localStorage.getItem('serverUrl'));

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

  useEffect(() => {
    (async () => {
      if (serverUrl) {
        const db = await dbConnection.open(serverUrl);
        const userDB = new UserDB(db);
        const user = await userDB.loggedInUser();

        await mastodonApi.open(serverUrl);

        setDB(db);
        setUserDB(userDB);
        setUser(user);
      }
    })();
  }, [serverUrl]);

  // If they haven't even picked what server they're working with, we need to
  // let them choose that.  We can't even open the database without knowing
  // what server we're talking to.
  if (!serverUrl) {
    return (
    <div className={"app-theme text-foreground bg-background " + (darkMode? "dark " : "")}>
      <header className="page-header shadow-md">
        <Logo />
        <UserSection darkMode={darkMode} setDarkMode={setDarkMode} />
      </header>
      <div id="page-body">
        <main>
          <ServerPicker setServerUrl={setServerUrl} />
        </main>
      </div>
    </div>
    );
  }

  if (typeof db === "undefined") {
    return "App loading...";
  }

  return (
    <>
    <DatabaseContext.Provider value={db}>
    <MastodonAPIContext.Provider value={mastodonApi}>
    <UserContext.Provider value={{user, setUser, sessionId, setSessionId, userDB}}>
    <DarkModeContext.Provider value={[darkMode, setDarkMode]}>
    <LanguageContext.Provider value={languageContext}>
    <SystemNotificationArea />
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
    </LanguageContext.Provider>
    </DarkModeContext.Provider>
    </UserContext.Provider>
    </MastodonAPIContext.Provider>
    </DatabaseContext.Provider>
    </>
  );
}

export default App;

function AppLoading() {
  return <>App loading...</>;
}
