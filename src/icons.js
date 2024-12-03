import { library, icon } from '@fortawesome/fontawesome-svg-core'
import { faBell, faCamera, faComment, faDoorOpen, faDoorClosed, faEarthAmericas, faFileLines, faFlag, faHouse, faImage, faPencil, faPenToSquare, faRepeat, faSquarePlus, faUser, faXmark } from '@fortawesome/free-solid-svg-icons'

library.add([faBell, faCamera, faComment, faDoorOpen, faDoorClosed, faEarthAmericas, faFileLines, faFlag, faHouse, faImage, faPencil, faPenToSquare, faRepeat, faSquarePlus, faUser, faXmark]);

export default {
  bell: icon({ prefix: 'fas', iconName: 'bell' }),
  camera: icon({ prefix: 'fas', iconName: 'camera' }),
  comment: icon({ prefix: 'fas', iconName: 'comment' }),
  earthAmericas: icon({ prefix: 'fas', iconName: 'earth-americas' }),
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
