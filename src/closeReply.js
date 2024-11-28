export function closeReply({post, setComposingReply, numReplies, setNumReplies, postsDB, replies, setReplies}) {
  setNumReplies(numReplies+1);
  setComposingReply(false);

  const updatedReplies = postsDB.getRepliesTo(post.inReplyTo);

  setReplies(updatedReplies);
}

export function closeReplyNoDBRefresh({post, setComposingReply, numReplies, setNumReplies, replies, setReplies}) {
  setNumReplies(numReplies+1);
  setComposingReply(false);

  const updatedReplies = [...replies, post];
  updatedReplies.sort((a, b) => a.createdAt < b.createdAt);

  setReplies(updatedReplies);
}
