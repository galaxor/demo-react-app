import {Accordion, AccordionItem} from "@nextui-org/accordion";
import { Button } from "@nextui-org/button"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import TimeAgo from 'javascript-time-ago'
import { useContext, useState } from 'react';
import { useLoaderData } from "react-router-dom";

import DatabaseContext from './DatabaseContext.jsx'
import icons from './icons.js'
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

  const [selectedKeys, setSelectedKeys] = useState();

  return <>
    <h2 className="my-5 text-xl font-bold">Edit History</h2>

    <p>Previous versions of this post.</p>

    <Button startContent={<FontAwesomeIcon icon={icons.eye} />}
      onPress={() => setSelectedKeys(new Set(Object.keys(versions)))}
    >
      Open All
    </Button>

    <Button startContent={<FontAwesomeIcon icon={icons.eyeSlash} />}
      onPress={() => setSelectedKeys(new Set([]))}
    >
      Close All
    </Button>

    <Accordion selectionMode="multiple" selectedKeys={selectedKeys} onSelectionChange={setSelectedKeys}>
    {Object.entries(versions).map(([updatedAt, postVersion]) => {
      const formattedTime = timeAgo.format(new Date(updatedAt))+", "+fullDateTime.format(new Date(updatedAt));

      const humanReadableTime = <time dateTime={updatedAt}>{formattedTime}</time>;

      return (
      <AccordionItem key={updatedAt} aria-label={formattedTime} title={humanReadableTime}>
        <Post showStats={false} post={postVersion} />
      </AccordionItem>
      );
    })}
    </Accordion>
  </>;
}
