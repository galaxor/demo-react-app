import './static/Avatar.css'

export default function Avatar({avatar}) {
  if (avatar===null) {
    return "";
  }
  
  return (
    <figure className="avatar">
    <div className="croppingRect">
    <img
      src={avatar.avatar}
      />
    </div>
    </figure>
  );
}
