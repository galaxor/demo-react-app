import { ToastContainer, toast } from 'react-toastify';
import { useContext } from 'react'

import DarkModeContext from './DarkModeContext.jsx'

export default function SystemNotificationArea() {
  const [darkMode, setDarkMode] = useContext(DarkModeContext);

  return (<ToastContainer theme={darkMode? "dark" : "light"} />);
}

