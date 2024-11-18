import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import RootFeed from './RootFeed.jsx'
import PopularFeed from './PopularFeed.jsx'
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
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
