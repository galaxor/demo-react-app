import { createContext } from 'react';

const PostDetailsContext = createContext({reactionsList: null, setPostDetails: null, numBoosts: null, setNumBoosts: null, numYourBoosts: null, setNumYourBoosts: null, boostPostsList: null, setBoostPostsList: null});
export default PostDetailsContext;
