import { useContext } from 'react'

import DatabaseContext from './DatabaseContext'
import { PostsDB } from './logic/posts.js'

import './static/ImageList.css'

export default function ImageList({post}) {
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);
  
  const imageBucket = postsDB.getImagesForPost(post.uri);

  if (Object.keys(imageBucket).length <= 0) { return ""; }

  return (
    <ul className="post-images">
      {Object.entries(imageBucket).map(([fileName, imageData]) => {
        console.log("bucket item", fileName, imageData);
        return ( <li key={fileName}><img src={imageData} /></li> );
      })}
    </ul>
  );
}
