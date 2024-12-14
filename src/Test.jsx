export default function Test() {
  const outline = 
    { text: "Thesis",
      children: [
      { text: "I",
        children: [
          { text: "A",
            children: [
            ],
          },
          { text: "B",
            children: [
              { text: "1",
                children: [
                ],
              },
            ],
          },
          { text: "C",
            children: [
            ],
          },
        ],
      },
      { text: "II",
        children: [
        ],
      },
      { text: "III",
        children: [
          { text: "A",
            children: [
            ],
          }
        ],
      },
    ],
  };

  return (
    <>
      <main className="test">
        <PostNReplies node={outline} />
      </main>
    </>
  );
}

function PostNReplies({node}) {
  console.log(node);
  return (
    <div className="post-and-replies">
      <article className="post">
        <div className="post">{node.text}</div>
        {node.children.length > 0?
          <ul className="replies">
            {node.children.map(child => {
              return <li><PostNReplies node={child} /></li>;
            })}
          </ul>
          : ""
        }
      </article>
    </div>
  );
}
