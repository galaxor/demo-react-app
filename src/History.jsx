import {Accordion, AccordionItem} from "@nextui-org/accordion";
import { Button } from "@nextui-org/button"
import { diffArrays, diffWordsWithSpace } from 'diff'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import ReactTimeAgo from 'react-time-ago'
import TimeAgo from 'javascript-time-ago'
import { useContext, useEffect, useState } from 'react';
import { useLoaderData } from "react-router-dom";
import {Fragment} from 'react'

import ClickableImage from './components/ClickableImage.jsx'
import DatabaseContext from './DatabaseContext.jsx'
import icons from './icons.js'
import LanguageContext from './LanguageContext.jsx'
import Post from './Post.jsx';
import { PostsDB } from './logic/posts.js'
import { fullDateTime } from './timeFormat.js'

import './static/History.css'

export default function History() {
  const languageContext = useContext(LanguageContext);
  const timeAgo = new TimeAgo(languageContext);

  const post = useLoaderData().post;

  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

  useEffect(() => {
    (async () => {
      const theVersions = await postsDB.getVersions(post.uri);
      setVersions(theVersions);
    })();
  }, []);

  const [versions, setVersions] = useState({});

  const [selectedKeys, setSelectedKeys] = useState();

  return <>
    <h2 className="my-5 text-xl font-bold">Revision History</h2>

    <p>This page lets you see previous revisions of the post, and review what changes were made when.</p>

    <p className="my-3">
    <Button startContent={<FontAwesomeIcon icon={icons.eye} />}
      onPress={() => setSelectedKeys(new Set([...Object.keys(versions), ...Object.keys(versions).map(version => `changes-${version}`)]))}
    >
      Open All
    </Button>

    <Button startContent={<FontAwesomeIcon icon={icons.eyeSlash} />}
      onPress={() => setSelectedKeys(new Set([]))}
    >
      Close All
    </Button>
    </p>

    <Accordion className="history" selectionMode="multiple" selectedKeys={selectedKeys} onSelectionChange={setSelectedKeys} variant="splitted">
    {Object.entries(versions).map(([updatedAt, postVersion]) => {
      const formattedTime = timeAgo.format(new Date(updatedAt))+", "+fullDateTime.format(new Date(updatedAt));

      const humanReadableTime = <time dateTime={updatedAt}><ReactTimeAgo date={new Date(updatedAt)} locale={languageContext} />, {fullDateTime.format(new Date(updatedAt))}</time>;

      const imageBucket = postVersion.images;

      return ([
        updatedAt,
        formattedTime,
        humanReadableTime,
        {...postVersion, images: imageBucket},
        <AccordionItem key={updatedAt} aria-label={formattedTime} title={humanReadableTime} classNames={{base: "bg-content1", heading: "font-bold"}}>
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

        const accordionItemDiff = 
          <AccordionItem key={`changes-${updatedAt}`} aria-label={`Changes introduced at ${formattedTime}`} title={<>Changes introduced {humanReadableTime}</>} classNames={{base: "bg-content2", heading: "font-bold"}}>
            <dl>
              <dt>Text</dt>
              <dd className="whitespace-pre-line">
                {diffWordsWithSpace(prevPost.text, postVersion.text).map(part => {
                  if (part.added) {
                    return <ins key={crypto.randomUUID()}>{part.value}</ins>;
                  } else if (part.removed) {
                    return <del key={crypto.randomUUID()}>{part.value}</del>;
                  } else {
                    return part.value;
                  }
                })}
              </dd>
            </dl>
            <ul>
              {imageDiff.map(imageChange => {
                if (imageChange.removed) {
                  // we need to pass prevPost so that it looks there for the
                  // images. The images have been removed, so they won't be
                  // in postVersion.
                  return <li key={`removed-${imageChange.value[0]}`}>
                    <ImageChangeTable
                      changeType="deletion"
                      caption={imageChange.length > 1? <>Images removed</> : <>Image removed</>}
                      imageHashes={imageChange.value}
                      postVersion={prevPost}
                    />
                  </li>;
                } else if (imageChange.added) {
                  return <li key={`added-${imageChange.value[0]}`}>
                    <ImageChangeTable
                      changeType="insertion"
                      caption={imageChange.length > 1? <>Images added</> : <>Image added</>}
                      imageHashes={imageChange.value}
                      postVersion={postVersion}
                    />
                  </li>;
                } else {
                  return <li key={`unchanged-${imageChange.value[0]}`}>
                    <ImageChangeTable
                      changeType="unchanged"
                      caption={imageChange.length > 1? <>Unchanged images</> : <>Unchanged image</>}
                      imageHashes={imageChange.value}
                      postVersion={postVersion}
                      prevPost={prevPost}
                    />
                  </li>;
                }
              })}
            </ul>
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

function ImageChangeTable({key, changeType, caption, imageHashes, postVersion, prevPost}) {
  // The prevPost argument is optional.  It will only be passed when we're
  // showing unchanged images, and we use it so we can diff the alt text.
  // Note that in "images removed", we also pass in prevPost, but we do it in
  // the slot named postVersion.  The reason for this is that here, the slot
  // marked postVersion will always be the one we look for images in.  That
  // way, this function doesn't have to know if we're displaying an image
  // removal, addition, or unchanged.

  return (
    <table className={`image-change change-${changeType}`} key={key}>
      <caption className={`change-${changeType}`}>{caption}</caption>
      <thead>
      <tr>
        <th>Image</th>
        <th>Alt text</th>
      </tr>
      </thead>
      <tbody>
      {imageHashes.map(imageHash => {
        // If prevPost is set, that's because the image was unchanged. In that
        // case, let's diff the alt text.
        if (typeof prevPost === "undefined") {
          // We don't have prevPost. It was either an added or removed image,
          // so we can't diff the alt text.
          return (
            <tr key={imageHash}>
              <td className="image">
                <ClickableImage 
                  fileName={postVersion.imagesByHash[imageHash].fileName}
                  imageHash={imageHash}
                  altText={postVersion.imagesByHash[imageHash].altText}
                  altTextLang={postVersion.imagesByHash[imageHash].altTextLang}
                />
              </td>
              <td className="alt-text">{postVersion.imagesByHash[imageHash].altText}</td>
            </tr>
          );
        } else {
          return (
            <tr key={imageHash}>
              <td className="image">
                <ClickableImage 
                  fileName={postVersion.imagesByHash[imageHash].fileName}
                  imageHash={imageHash}
                  altText={postVersion.imagesByHash[imageHash].altText}
                  altTextLang={postVersion.imagesByHash[imageHash].altTextLang}
                />
              </td>
              <td className="alt-text">
                {diffWordsWithSpace(prevPost.imagesByHash[imageHash].altText, postVersion.imagesByHash[imageHash].altText).map(part => {
                  if (part.added) {
                    return <ins key={crypto.randomUUID()}>{part.value}</ins>;
                  } else if (part.removed) {
                    return <del key={crypto.randomUUID()}>{part.value}</del>;
                  } else {
                    return part.value;
                  }
                })}
              </td>
            </tr>
          );
        }
      })}
      </tbody>
    </table>
  );
}
