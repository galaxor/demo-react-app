import DOMPurify from 'dompurify'

export default function DangerousHTML({children}) {
  return <span className="user-content" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(children)}} />;
}
