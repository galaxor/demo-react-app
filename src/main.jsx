import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.jsx'
import PopularFeed from './PopularFeed.jsx'
import ProfileEdit from './ProfileEdit.jsx'
import RootFeed from './RootFeed.jsx'
import YourFeed from './YourFeed.jsx'

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <RootFeed />,
      },
      {
        path: "/home",
        element: <YourFeed />,
      },
      {
        path: "/popular",
        element: <PopularFeed />,
      },
      {
        path: "/profile/edit",
        element: <ProfileEdit />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
