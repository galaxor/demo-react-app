import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { NextUIProvider } from '@nextui-org/react'
import './index.css'

import App from './App.jsx'
import BoostsDetail from './BoostsDetail.jsx'
import CreatePost from './CreatePost.jsx'
import History from './History.jsx'
import LoginLanding from './LoginLanding.jsx'
import PopularFeed from './PopularFeed.jsx'
import PostsByPerson from './PostsByPerson.jsx'
import PostDetails from './PostDetails.jsx'
import PostSingle from './PostSingle.jsx'
import ProfileBio from './ProfileBio.jsx'
import ProfileEdit from './ProfileEdit.jsx'
import ProfileView from './ProfileView.jsx'
import QuoteBoost from './QuoteBoost.jsx'
import QuoteBoostsDetail from './QuoteBoostsDetail.jsx'
import ReactionsDetail from './ReactionsDetail.jsx'
import RootFeed from './RootFeed.jsx'
import Thread from './Thread.jsx'
import YourFeed from './YourFeed.jsx'
import WhoFollowsThem from './WhoFollowsThem.jsx'
import WhoDoTheyFollow from './WhoDoTheyFollow.jsx'

import Test from './Test.jsx'

import Database from "./logic/database.js";
import MastodonAPI from './mastodon-api/mastodon-api.js'
import PostOffice from './workers/PostOffice.js'
import { getPersonLoader } from './logic/people.js';
import { getPostLoader } from './logic/posts.js';

import workerUrl from './workers/worker.js?worker&url'

import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useNavigate,
  useHref,
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
const mastodonApi = new MastodonAPI(database);
const worker = new Worker(workerUrl, {type: 'module'});
const postOffice = new PostOffice(worker);

navigator.serviceWorker.register("/service-worker.js");

const serviceWorker = new Promise(resolve => {
  navigator.serviceWorker.ready.then(
    registration => {
      const serviceWorkerPostOffice = new PostOffice(registration.active, navigator.serviceWorker);
      resolve(serviceWorkerPostOffice);
    }
  );
});

// In case we're deployed in a subdirectory.
// Set VITE_PATH_PREFIX in .env, .env.development, or .env.production.
// The BASE_URL here will be set by vite.config.js, either when running the dev
// server or building for deployment.
const prefix=import.meta.env.BASE_URL.replace(/\/+$/, '');

const router = createBrowserRouter([
  {
    element: <CoolApp />,
    children: [
      {
        path: "/",
        element: <App dbConnection={database} mastodonApi={mastodonApi} postOffice={postOffice} serviceWorker={serviceWorker} />,
        children: [
          {
            path: "/login-landing",
            element: <LoginLanding />,
          },
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
            element: <ProfileView loggedInUser={true}><PostsByPerson showReplies={false} /></ProfileView>,
          },
          {
            path: "/people/:handle",
            loader: getPersonLoader(database),
            element: <ProfileView />,
            children: [
              {
                index: true,
                element: <PostsByPerson showReplies={false} />,
              },
              {
                path: "/people/:handle/posts-replies",
                element: <PostsByPerson showReplies={true} />,
              },
              {
                path: "/people/:handle/followers",
                element: <WhoFollowsThem />,
              },
              {
                path: "/people/:handle/follows",
                element: <WhoDoTheyFollow />,
              },
            ],
          },
          {
            path: "/post/:postUri",
            loader: getPostLoader(database),
            element: <Thread />,
          },
          {
            path: "/post/:postUri/boosts",
            loader: getPostLoader(database),
            element: <PostDetails><BoostsDetail /></PostDetails>,
          },
          {
            path: "/post/:postUri/quote-boosts",
            loader: getPostLoader(database),
            element: <PostDetails><QuoteBoostsDetail /></PostDetails>,
          },
          {
            path: "/post/:postUri/reactions",
            loader: getPostLoader(database),
            element: <PostDetails><ReactionsDetail /></PostDetails>,
          },
          {
            path: "/post/:postUri/history",
            loader: getPostLoader(database),
            element: <PostDetails><History /></PostDetails>,
          },
          {
            path: "/create",
            element: <CreatePost />
          },
          {
            path: "/quote-boost/:postUri",
            loader: getPostLoader(database),
            element: <QuoteBoost />,
          },
        ],
      },
      {
        path: "/test",
        element: <Test dbConnection={database} />,
      },

    ],
  },
], { basename: prefix }
);

function CoolApp() {
  const navigate = useNavigate();

  return (
    <NextUIProvider navigate={navigate} useHref={useHref}>
      <Outlet />
    </NextUIProvider>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router}>
      <CoolApp />
    </RouterProvider>
  </StrictMode>,
)
