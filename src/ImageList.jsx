import { useContext } from 'react'

import DatabaseContext from './DatabaseContext'
import { PostsDB } from './logic/posts.js'

import './static/ImageList.css'

export default function ImageList({post}) {
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);
  
  const imageBucket = postsDB.getImagesForPost(post.uri);

  if (!imageBucket || Object.keys(imageBucket).length <= 0) { return ""; }

  return (
    <div className="post-images">
      <ul className="post-images">
        {Object.entries(imageBucket).map(([fileName, {data: imageData, altText}]) => {
          return ( <li key={fileName}><img src={imageData} alt={altText} /> {altText && <details><summary>Alt Text</summary>{altText}</details>}</li> );
        })}
      </ul>
    </div>
  );
}
