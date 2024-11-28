PostSingle
  -> Post
  -> Editor?
  -> Replies (replies is a state variable managed by PostSingle)
    -> PostAndReplies[]
      -> Post
      -> Editor?
      -> Replies (replies is a state variable managed by PostAndReplies)
        -> PostAndReplies[]
  -> PostAndReplies (to orig post, with prune)
    -> Post
    -> Editor?
    -> Replies (Replies is a state variable managed by PostAndReplies)
      -> PostAndReplies[]


PostSingle and PostAndReplies pass knownReplies and numReplies, with setters to Post.
  Post passes those setters to PostEditor for making replies.


PopularPosts
  -> PostAndYourNewReplies
    -> Editor?
    -> Replies (replies is a state variable managed by PostAndYourNewReplies)
      -> PostAndReplies[]
        -> Post
        -> Editor?
        -> Replies (replies is a state variable managed by PostAndReplies)
          -> PostAndReplies[]
