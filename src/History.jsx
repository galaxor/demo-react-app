import {Accordion, AccordionItem} from "@nextui-org/accordion";
import { Button } from "@nextui-org/button"
import { diffWordsWithSpace } from 'diff'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import TimeAgo from 'javascript-time-ago'
import { useContext, useState } from 'react';
import { useLoaderData } from "react-router-dom";
import { v4 as uuidv4 } from "uuid"

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

      return ([
        updatedAt,
        formattedTime,
        humanReadableTime,
        postVersion,
        <AccordionItem key={updatedAt} aria-label={formattedTime} title={humanReadableTime}>
          <Post showStats={false} post={postVersion} />
        </AccordionItem>
      ]);
    }).reduce((state, [updatedAt, formattedTime, humanReadableTime, postVersion, accordionItem]) => {
      if (state.length === 0) {
        return [...state, accordionItem, postVersion];
      } else {
        
        const prevPost = state[state.length-1];

        const accordionItemDiff = 
          <AccordionItem key={`changes-${updatedAt}`} aria-label={`Changes introduced at ${formattedTime}`} title={<>Changes introduced {humanReadableTime}</>}>
            {diffWordsWithSpace(prevPost.text, postVersion.text).map(part => {
              if (part.added) {
                return <ins key={uuidv4()}>{part.value}</ins>;
              } else if (part.removed) {
                return <del key={uuidv4()}>{part.value}</del>;
              } else {
                return part.value;
              }
            })}
          </AccordionItem>
        ;

        // We peel off the previous postVersion from the state and then stick
        // our own postVersion so the next iteration can read it as the
        // "previous postVersion", so it can diff them.
        // Make sure to use slice(0,-1) to peel the final "post version" off
        // when passing the state array off to React to render.  We only want
        // AccordionItems in the state array that we give to React.
        return [...state.slice(0, -1), accordionItemDiff, accordionItem, postVersion];
      }
    }, []).slice(0,-1)}
    </Accordion>
  </>;
}
