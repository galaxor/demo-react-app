export default function Post({post, dateFormat}) {
  return (
    <article className="post h-entry">
      <span className="post-date">
        Posted
        <a className="post-time dt-published" href={'/post/' + post.uri}>
            <span className="dt-published published-date">
              <time dateTime={post.createdAt}>{dateFormat.format(new Date(post.createdAt))}</time>
              {/* This is where I would put the "time ago" */}
            </span>

            {post.updatedAt !== post.createdAt ?
              <span className="dt-updated updated-date">
                <time dateTime={post.updatedAt}>{dateFormat.format(new Date(post.updatedAt))}</time>
                {/* This is where I would put the "time ago" */}
              </span>
              :
              ''
            }
        </a>
      </span>
          
      <span className="post-author">
        By
        <a className="p-author h-card" href={'/people/' + post.authorPerson.handle}>
          {post.authorPerson.avatar? 
            <img alt="" className="avatar-small" href={post.authorPerson.avatar} />
            :
            ''
          }
          <bdi className="author-displayName">{post.authorPerson.displayName}</bdi>
          <span className="author-handle">{post.authorPerson.handle}</span>
        </a>
      </span>

      <div className="post-text e-content" lang={post.language}>{post.text}</div>
    </article>
  );
}
