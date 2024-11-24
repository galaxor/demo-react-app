import Post from './Post.jsx'

export default function PostsList({posts}) {
  
  return (
    <div className={"posts-list" + (posts.length > 0 || " no-posts")}>
      {(posts && posts.length > 0) ?
        <>
        {posts.map((post) => { 
            return (
              <Post key={post.uri} post={post} />
            );
          })}
        </>

        :
        <> No posts to display. </>
      }

    </div>
  );
}
