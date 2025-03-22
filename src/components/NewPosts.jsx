import NumberDisplay from './NumberDisplay.jsx'

export default function NewPosts({newPosts, setNewPosts, onClick}) {
  if (newPosts.length === 0) {
    return "";
  }

  return <>
    <a href="#" onClick={clickNewPostsFn({newPosts, setNewPosts, onClick})} role="status" aria-live="polite">
      <NumberDisplay number={newPosts.length} compact={false} /> new posts available.
    </a>
  </>;
}

function clickNewPostsFn({newPosts, setNewPosts, onClick}) {
  return event => {
    event.preventDefault();
    if (typeof onClick === "function") {
      onClick([...newPosts]);
      setNewPosts([]);
    }
  };
}
