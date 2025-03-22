import DOMPurify from 'dompurify'

const DOMPurifyConfig = {
  FORBID_ATTR: [
    'class',
  ],
};

export default function DangerousHTML({children}) {
  return <span className="user-content" dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(children, DOMPurifyConfig)}} />;
}
