import {Accordion, AccordionItem} from "@nextui-org/accordion";
import { useContext } from 'react';
import { useLoaderData } from "react-router-dom";

import DatabaseContext from './DatabaseContext.jsx'
import Post from './Post.jsx';
import { PostsDB } from './logic/posts.js'

export default function History() {
  const post = useLoaderData().post;

  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);
  const versions = postsDB.getVersions(post.uri);

  console.log(versions);

  return <>
    <h2 className="my-5 text-xl font-bold">Edit History</h2>

    <p>Previous versions of this post.</p>

    <Accordion selectionMode="multiple">
    {Object.entries(versions).map(([updatedAt, postVersion]) => {
      return (
      <AccordionItem key={updatedAt} aria-label={updatedAt} title={updatedAt}>
        <Post showStats={false} post={postVersion} />
      </AccordionItem>
      );
    })}
    </Accordion>
  </>;
}
