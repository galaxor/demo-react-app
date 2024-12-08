import { Button } from "@nextui-org/button"
import { Card, CardHeader, CardBody, CardFooter } from "@nextui-org/card"
import { forwardRef, useImperativeHandle, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {Textarea} from "@nextui-org/input";

import icons from './icons.js'

import './static/PostImageEditor.css'

function removeImageFunction({fileName, uploadedImages, setUploadedImages, imageBucket}) {
  return () => {
    delete imageBucket.current[fileName];
    const newUploadedImages = {...uploadedImages};
    delete newUploadedImages[fileName];
    setUploadedImages(newUploadedImages);
  };
}

const PostImageEditor = forwardRef(function PostImageEditor(props, ref) {
  // When we upload an image, it goes in the image bucket.  The bucket is like:
  //  { "filename": dataUrl, ... }
  // The state is just a list of pointers to the bucket.
  // That way, we don't have to copy all the image data every time we add an image.
  const imageBucket = useRef({});

  const { uploadedImages, setUploadedImages } = props;

  const fileUploaderRef = useRef(null);

  useImperativeHandle(ref, () => {
    return {
      getImages() {
        for (const fileName in uploadedImages) {
          imageBucket.current[fileName].altText = uploadedImages[fileName].altText;
        }
        return imageBucket.current;
      },
    };
  }, [uploadedImages]);

  return (
    <>
    <div className="post-image-editor">
      {Object.keys(uploadedImages).length > 0 ?
        <ul className="uploaded-images">
          {Object.keys(uploadedImages).map(fileName => {
            return (
              <li key={fileName}>
                <Card>
                  <CardHeader>
                    <Button variant="light" isIconOnly aria-label="Remove" onClick={removeImageFunction({fileName, setUploadedImages, uploadedImages, imageBucket})}>
                      <FontAwesomeIcon icon={icons.circleXmark} size="xl" />
                    </Button>
                  </CardHeader>
                  <CardBody>
                    <img className="h-[200px] w-auto object-contain" src={imageBucket.current[fileName].data} />
                    <Textarea label="Alt text" placeholder="Describe the image as if you're talking to someone who can't see it." 
                        value={uploadedImages[fileName].altText}
                        onChange={(e) => {
                          const newUploadedImages = {...uploadedImages};
                          newUploadedImages[fileName].altText = e.target.value;
                          setUploadedImages(newUploadedImages);
                        }} />
                  </CardBody>
                </Card>
              </li>
            );
          })}
        </ul>
        : ""
      }

      <Button className="w-[50px] h-[64px]" onPress={(e) => fileUploaderRef.current.click()}>
        <label ref={fileUploaderRef} className="post-image-upload block w-full text-wrap" tabIndex="-1">
          <input type="file" className="post-image-upload-input visually-hidden" name="new-image" tabIndex="-1"
            accept="image/*"
            onChange={(e) => imageUpload({e, imageBucket, uploadedImages, setUploadedImages})}
          />
          <span className="icon"><FontAwesomeIcon icon={icons.image} /></span><br />Upload Image
        </label>
      </Button>
    </div>
    </>
  );
});

function imageUpload({e, imageBucket, uploadedImages, setUploadedImages}) {
  const reader = new FileReader();
  reader.addEventListener("load", (x) => {
    const fileName = e.target.files[0].name;
    const newImage = reader.result;

    imageBucket.current[fileName] = { data: newImage, altText: "" };

    const imageList = {...uploadedImages};
    imageList[fileName] = { altText: "" };
    setUploadedImages(imageList);
  });

  reader.readAsDataURL(e.target.files[0]);
}

export default PostImageEditor;
