import { useContext, useEffect, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Link as Link2 } from "@nextui-org/link"
import { useDisclosure } from "@nextui-org/use-disclosure"

import ClickableImage from './components/ClickableImage.jsx'
import DatabaseContext from './DatabaseContext'
import { PostsDB } from './logic/posts.js'

import './static/ImageList.css'

export default function ImageList({post}) {
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

  const [imageBucket, setImageBucket] = useState({});

  useEffect(() => {
    (async () => setImageBucket(await postsDB.getImagesForPost(post.uri, post.updatedAt) ?? {}))();
  }, []);

  if (!imageBucket || Object.keys(imageBucket).length <= 0) { return ""; }

  return (
    <div className="post-images">
      <ul className={"post-images "+(Object.keys(imageBucket).length > 1? "grid grid-cols-2" : "")}>
        {Object.entries(imageBucket).map(([fileName, {image: imageHash, altText, altTextLang}]) => {
          return ( <li key={fileName}><ClickableImage fileName={fileName} imageHash={imageHash} altTextLang={altTextLang} altText={altText} /></li> );
        })}
      </ul>
    </div>
  );
}
