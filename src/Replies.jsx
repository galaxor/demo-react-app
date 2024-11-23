import Post from './Post.jsx';
import PostsDB from './logic/posts.js';
import DatabaseContext from './DatabaseContext.jsx'
import { useContext } from 'react';

export default function Replies({postRepliedTo, prune}) {
  const db = useContext(DatabaseContext);
  const postsDB = new PostsDB(db);

  const replies = postsDB.getRepliesTo(postRepliedTo.uri);

  return (
    <ul className="replies">
      {replies.map(reply => {
        if (reply.uri === prune) {
          return "";
        } else {
          const repliesToReply = postsDB.getRepliesTo(reply.uri);
          return (
          <li>
            <Post key={reply.uri} post={reply} />
            {repliesToReply.length > 0 &&
              <ul className="replies">
                <Replies postRepliedTo={reply} />
              </ul>
            }
          </li>
          );
        }
      })
    }
    </ul>
  );
}
