export function closeReply({post, setComposingReply, numReplies, setNumReplies, postsDB, replies, setReplies}) {
  setNumReplies(numReplies+1);
  setComposingReply(false);

  const updatedReplies = postsDB.getRepliesTo(post.inReplyTo);

  setReplies(updatedReplies);
}

export function closeReplyNoDBRefresh({post, setComposingReply, numReplies, setNumReplies, replies, setReplies, sortFn}) {
  setNumReplies(numReplies+1);
  setComposingReply(false);

  const updatedReplies = [...replies, post];

  const useSortFn = sortFn ?? ( (a, b) => a.createdAt === b.createdAt? 0 : a.createdAt < b.createdAt? -1 : 1);
  updatedReplies.sort(useSortFn);

  setReplies(updatedReplies);

  return post;
}
