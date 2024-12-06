export function clickPost(e) {
  // A little old-school javascript to pass the clicks to the link that goes to
  // the post's PostSingle page.

  // Find the article at the top of the post.
  var node = e.target;
  for ( ; node.nodeName !== "ARTICLE"; node = node.parentElement) { }

  // Find all links.
  const links = node.querySelectorAll('a');

  // Is the target a child of a link, or a link itself?
  const linksThatContainTarget = Array.from(links.values().filter(link => link.contains(e.target)));

  // Do the same thing for the "more options" menu.
  // Also find the "more options" menu.
  const moreOptionsMenu = node.querySelector('li.more-options-menu');

  if (linksThatContainTarget.length > 0 || moreOptionsMenu.contains(e.target)) {
    return;
  } else {
    var node = e.target;
    for ( ; node.nodeName !== "ARTICLE"; node = node.parentElement) { }
    node.querySelector('a.post-time').click();
  }
}
