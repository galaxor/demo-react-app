import {Accordion, AccordionItem} from "@nextui-org/accordion";
import TimeAgo from 'javascript-time-ago'
import { useContext } from 'react';
import { useLoaderData } from "react-router-dom";

import DatabaseContext from './DatabaseContext.jsx'
import LanguageContext from './LanguageContext.jsx'
import Post from './Post.jsx';
import { PostsDB } from './logic/posts.js'
import { fullDateTime } from './timeFormat.js'

export default function History() {
  const languageContext = useContext(LanguageContext);
  const timeAgo = new TimeAgo(languageContext);

  const post = useLoaderData().post;

  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);
  const versions = postsDB.getVersions(post.uri);

  return <>
    <h2 className="my-5 text-xl font-bold">Edit History</h2>

    <p>Previous versions of this post.</p>


    <Accordion selectionMode="multiple">
    {Object.entries(versions).map(([updatedAt, postVersion]) => {
  // We're using ReactTimeAgo in the markup, but plain javascript-time-ago in the aria.
      const formattedTime = timeAgo.format(new Date(updatedAt))+", "+fullDateTime.format(new Date(updatedAt));
      return (
      <AccordionItem key={updatedAt} aria-label={formattedTime} title={formattedTime}>
        <Post showStats={false} post={postVersion} />
      </AccordionItem>
      );
    })}
    </Accordion>
  </>;
}
