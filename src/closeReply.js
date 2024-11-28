export function closeReply({post, setComposingReply, numReplies, setNumReplies, postsDB, replies, setReplies}) {
  setNumReplies(numReplies+1);
  setComposingReply(false);

  const updatedReplies = postsDB.getRepliesTo(post.inReplyTo);

  setReplies(updatedReplies);
}
