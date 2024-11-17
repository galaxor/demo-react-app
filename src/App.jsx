import Logo from './Logo.jsx';
import UserSection from './UserSection.jsx';
import NavigationSidebar from './NavigationSidebar.jsx';
import FeaturedFeed from './FeaturedFeed.jsx';

import './App.css'

import { Outlet } from "react-router-dom";

function App() {
  return (
    <>
    <header>
      <Logo />
      <UserSection />
    </header>

    <NavigationSidebar />
    <Outlet />
    </>
  );
}

export default App;
