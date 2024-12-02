export function clickPost(e) {
  // A little old-school javascript to pass the clicks to the link that goes to
  // the post's PostSingle page.

  // Find the article at the top of the post.
  var node = e.target;
  for ( ; node.nodeName !== "ARTICLE"; node = node.parentElement) { }

  // Find the reply link.
  const replyLink = node.querySelector('a.num-replies');
  
  // Is the target a child of the reply link, or the reply link itself?
  var node = e.target;
  for ( ; node != replyLink && node.nodeName !== "ARTICLE"; node = node.parentElement) { }
  if (node === replyLink) {
    return;
  } else {
    var node = e.target;
    for ( ; node.nodeName !== "ARTICLE"; node = node.parentElement) { }
    node.querySelector('a.post-time').click();
  }
}
