import { library, icon } from '@fortawesome/fontawesome-svg-core'
import { faBars, faBell, faCamera, faCircleXmark, faComment, faCopy, faDoorOpen, faDoorClosed, faEarthAmericas, faEllipsis, faFileLines, faFlag, faHouse, faImage, faPencil, faPenToSquare, faRepeat, faSquarePlus, faUser, faXmark } from '@fortawesome/free-solid-svg-icons'

library.add([faBars, faBell, faCamera, faCircleXmark, faComment, faCopy, faDoorOpen, faDoorClosed, faEarthAmericas, faEllipsis, faFileLines, faFlag, faHouse, faImage, faPencil, faPenToSquare, faRepeat, faSquarePlus, faUser, faXmark]);

export default {
  bars: icon({ prefix: 'fas', iconName: 'bars' }),
  bell: icon({ prefix: 'fas', iconName: 'bell' }),
  camera: icon({ prefix: 'fas', iconName: 'camera' }),
  circleXmark: icon({ prefix: 'fas', iconName: 'circle-xmark' }),
  comment: icon({ prefix: 'fas', iconName: 'comment' }),
  copy: icon({ prefix: 'fas', iconName: 'copy' }),
  earthAmericas: icon({ prefix: 'fas', iconName: 'earth-americas' }),
  ellipsis: icon({ prefix: 'fas', iconName: 'ellipsis' }),
  fileLines: icon({ prefix: 'fas', iconName: 'file-lines' }),
  flag: icon({ prefix: 'fas', iconName: 'flag' }),
  house: icon({ prefix: 'fas', iconName: 'house' }),
  doorOpen: icon({ prefix: 'fas', iconName: 'door-open' }),
  doorClosed: icon({ prefix: 'fas', iconName: 'door-closed' }),
  image: icon({ prefix: 'fas', iconName: 'image' }),
  pencil: icon({ prefix: 'fas', iconName: 'pencil' }),
  penToSquare: icon({ prefix: 'fas', iconName: 'pen-to-square' }),
  repeat: icon({ prefix: 'fas', iconName: 'repeat' }),
  squarePlus: icon({ prefix: 'fas', iconName: 'square-plus' }),
  user: icon({ prefix: 'fas', iconName: 'user' }),
  xmark: icon({ prefix: 'fas', iconName: 'xmark' }),
}
