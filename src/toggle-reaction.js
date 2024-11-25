export function toggleReaction({user, postsDB, post, reaction, reactionTotals, setReactionTotals, newValue, yourReactions, setYourReactions}) {
  const createdAt = new Date().toISOString();

  // Make the change in the database
  postsDB.setReaction({reactorHandle: user.handle, reactingTo: post.uri, reaction, createdAt, newValue});

  // Set the "your reactions" state based on what's in the database now.
  // (this will refresh from the database, so if you did a different reaction
  // in another window, we'll get that change now).
  setYourReactions(postsDB.getReactionsByPerson(user.handle, post.uri));

  // Refresh the reaction totals while we're at it.
  // That way, whenever you react to something, you will see what other people
  // have been doing.
  // This will probably also be periodically refreshed by info we subscribe to
  // from the server thru websocket or something.
  setReactionTotals(postsDB.getReactionsTo(post.uri));
}
