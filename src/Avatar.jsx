import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import icons from './icons.js'
import hashSum from 'hash-sum'

export default function Avatar({person, size}) {
  const avatarFallbackColor = hashSum(person.handle).substring(0,6);
  const inverseFallbackColor = (0xffffff - parseInt('0x'+avatarFallbackColor)).toString(16);

  return (
    <>
    {person.avatar ?
      <img className={"avatar u-photo " + size} src={person.avatar} alt="" />
      :
      <span className={"avatar " + size} style={{backgroundColor: '#'+avatarFallbackColor}}>
        <FontAwesomeIcon icon={icons.user} />
      </span>
    }
    </>
  );
}
