import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

import App from './App.jsx'
import PopularFeed from './PopularFeed.jsx'
import PostsByPerson from './PostsByPerson.jsx'
import PostSingle from './PostSingle.jsx'
import ProfileBio from './ProfileBio.jsx'
import ProfileEdit from './ProfileEdit.jsx'
import ProfileView from './ProfileView.jsx'
import RootFeed from './RootFeed.jsx'
import YourFeed from './YourFeed.jsx'
import WhoFollowsThem from './WhoFollowsThem.jsx'
import WhoDoTheyFollow from './WhoDoTheyFollow.jsx'

import Database from "./logic/database.js";
import { getPersonLoader } from './logic/people.js';
import { getPostLoader } from './logic/posts.js';

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

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

const database = new Database();

const router = createBrowserRouter([
  {
    path: "/",
    element: <App db={database} />,
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
      {
        path: "/profile",
        element: <ProfileView loggedInUser={true} />,
      },
      {
        path: "/people/:handle",
        loader: getPersonLoader(database),
        element: <ProfileView />,
        children: [
          {
            index: true,
            loader: getPersonLoader(database),
            element: <ProfileBio />,
          },
          {
            path: "/people/:handle/posts",
            loader: getPersonLoader(database),
            element: <PostsByPerson />,
          },
          {
            path: "/people/:handle/followers",
            loader: getPersonLoader(database),
            element: <WhoFollowsThem />,
          },
          {
            path: "/people/:handle/follows",
            loader: getPersonLoader(database),
            element: <WhoDoTheyFollow />,
          },
        ],
      },
      {
        path: "/post/:postUri",
        loader: getPostLoader(database),
        element: <PostSingle />,
      },
    ],
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
