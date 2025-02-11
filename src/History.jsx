import {Accordion, AccordionItem} from "@nextui-org/accordion";
import { Button } from "@nextui-org/button"
import { diffArrays, diffWordsWithSpace } from 'diff'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import TimeAgo from 'javascript-time-ago'
import { useContext, useState } from 'react';
import { useLoaderData } from "react-router-dom";
import { v4 as uuidv4 } from "uuid"
import {Fragment} from 'react'

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

      const imageBucket = postsDB.getImagesForPost(postVersion.uri, postVersion.updatedAt);

      return ([
        updatedAt,
        formattedTime,
        humanReadableTime,
        {...postVersion, images: imageBucket},
        <AccordionItem key={updatedAt} aria-label={formattedTime} title={humanReadableTime} className="bg-content1">
          <Post showStats={false} post={postVersion} />
        </AccordionItem>
      ]);
    }).reduce((state, [updatedAt, formattedTime, humanReadableTime, postVersion, accordionItem]) => {
      // Right now, the images are indexed by filename.
      // In order to do the diff and find out what images have been added or
      // removed, I want a version of the images array that is indexed by image
      // hash instead, since that's the more meaningful attribute.  If, in one
      // version, they included an image, and in the next version, they
      // unlinked that image but then re-uploaded the same image with a
      // different filename, I don't want to be telling people that's a new
      // image.
      postVersion.imagesByHash = {};
      for (const fileName in postVersion.images) {
        const hash = postVersion.images[fileName].image;
        postVersion.imagesByHash[hash] = {...postVersion.images[fileName], fileName};
      }

      if (state.length === 0) {
        return [...state, accordionItem, postVersion];
      } else {
        
        const prevPost = state[state.length-1];

        const prevImageHashes = Object.keys(prevPost.imagesByHash);
        const imageHashes = Object.keys(postVersion.imagesByHash);
        const imageDiff = diffArrays(prevImageHashes, imageHashes);

        console.log(imageDiff);

        const accordionItemDiff = 
          <AccordionItem key={`changes-${updatedAt}`} aria-label={`Changes introduced at ${formattedTime}`} title={<>Changes introduced {humanReadableTime}</>} className="bg-content2">
            <dl>
              <dt>Text</dt>
              <dd className="whitespace-pre-line">
                {diffWordsWithSpace(prevPost.text, postVersion.text).map(part => {
                  if (part.added) {
                    return <ins key={uuidv4()}>{part.value}</ins>;
                  } else if (part.removed) {
                    return <del key={uuidv4()}>{part.value}</del>;
                  } else {
                    return part.value;
                  }
                })}
              </dd>
              {imageDiff.map(imageChange => {
                if (imageChange.removed) {
                  return imageChangeTable({
                    key: `removed-${imageChange.value[0]}`,
                    caption: imageChange.length > 1? <>Images removed</> : <>Image removed</>,
                    imageHashes: imageChange.value,

                    // we need to pass prevPost so that it looks there for the
                    // images. The images have been removed, so they won't be
                    // in postVersion.
                    postVersion: prevPost,
                  });
                } else if (imageChange.added) {
                  return imageChangeTable({
                    key: `added-${imageChange.value[0]}`,
                    caption: imageChange.length > 1? <>Images added</> : <>Image added</>,
                    imageHashes: imageChange.value,
                    postVersion,
                  });
                } else {
                  return imageChangeTable({
                    key: `unchanged-${imageChange.value[0]}`,
                    caption: imageChange.length > 1? <>Unchanged images</> : <>Unchanged image</>,
                    imageHashes: imageChange.value,
                    postVersion,
                  });
                }
              })}
            </dl>
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

function imageChangeTable({key, caption, imageHashes, postVersion}) {
  return (
    <table className="image-change" key={key}>
      <caption>{caption}</caption>
      <thead>
        <th>Image</th>
        <th>Alt text</th>
      </thead>
      <tbody>
      {imageHashes.map(imageHash => {
        return (
          <tr key={imageHash}>
            <td className="image">{imageHash}</td>
            <td className="alt-text">{postVersion.imagesByHash[imageHash].altText}</td>
          </tr>
        );
      })}
      </tbody>
    </table>
  );
}
