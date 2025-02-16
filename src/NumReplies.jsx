import { forwardRef, useContext, useEffect, useState, useRef, useImperativeHandle } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'

import DatabaseContext from './DatabaseContext.jsx'
import LanguageContext from './LanguageContext.jsx'
import icons from './icons.js'
import { PostsDB } from './logic/posts.js';
import UserContext from './UserContext.jsx'

const NumReplies = forwardRef(function NumReplies(props, ref) {
  const {post, setComposingReply, numReplies} = props;

  const { user } = useContext(UserContext);
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

  const language = useContext(LanguageContext);

  const [myNumReplies, setMyNumReplies] = useState(numReplies);

  useEffect(() => {
    (async () => {
      if (typeof numReplies === "undefined") {
        setMyNumReplies(await postsDB.getNumRepliesTo(post.uri));
      }
    })();
  }, []);

  const numRepliesDisplay = Intl.NumberFormat(language, {
    notation: "compact",
    maximumFractionDigits: 1
  }).format(numReplies ?? myNumReplies)


  const replyLinkRef = useRef();

  useImperativeHandle(ref, () => {
    return {
      focus() {
        replyLinkRef.current && replyLinkRef.current.focus();
      },
    };
  }, []);

  const iconAndNumber = (<>
    <span className="num-replies-icon"><FontAwesomeIcon icon={icons.comment} size="lg" /></span> {" "}
    <span className="num-replies-num">{numRepliesDisplay}</span>
  </>);

  return (
    <span className="num-replies" aria-label="Replies">
      {iconAndNumber}
    </span>
  );
});

export default NumReplies;
