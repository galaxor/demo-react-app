import { forwardRef, useImperativeHandle, useRef, useState } from 'react'

import './static/PostImageEditor.css'

const PostImageEditor = forwardRef(function PostImageEditor(props, ref) {
  // When we upload an image, it goes in the image bucket.  The bucket is like:
  //  { "filename": dataUrl, ... }
  // The state is just a list of pointers to the bucket.
  // That way, we don't have to copy all the image data every time we add an image.
  const imageBucket = useRef({});

  const [uploadedImages, setUploadedImages] = useState({});

  useImperativeHandle(ref, () => {
    return {
      getImages() {
        return imageBucket.current;
      },
    };
  }, []);

  return (
    <>
    <div className="post-image-editor">
      <ul className="uploaded-images">
        {Object.keys(uploadedImages).map(fileName => {
          return (
            <li key={fileName}><img src={imageBucket.current[fileName]} /></li>
          );
        })}
      </ul>

      <label className="post-image-upload">
        <input type="file" className="post-image-upload-input" name="new-image"
          accept="image/*"
          onChange={(e) => imageUpload({e, imageBucket, uploadedImages, setUploadedImages})}
        />
        📷<br />Upload Image
      </label>
    </div>
    </>
  );
});

function imageUpload({e, imageBucket, uploadedImages, setUploadedImages}) {
  const reader = new FileReader();
  reader.addEventListener("load", (x) => {
    const fileName = e.target.files[0].name;
    const newImage = reader.result;

    imageBucket.current[fileName] = newImage;

    const imageList = {...uploadedImages};
    imageList[fileName] = true;
    setUploadedImages(imageList);
  });

  reader.readAsDataURL(e.target.files[0]);
}

export default PostImageEditor;
