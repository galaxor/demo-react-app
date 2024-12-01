import { library, icon } from '@fortawesome/fontawesome-svg-core'
import { faBell, faCamera, faDoorOpen, faDoorClosed, faEarthAmericas, faFlag, faHouse, faPenToSquare, faSquarePlus, faUser } from '@fortawesome/free-solid-svg-icons'

library.add([faBell, faCamera, faDoorOpen, faDoorClosed, faEarthAmericas, faFlag, faHouse, faPenToSquare, faSquarePlus, faUser]);

export default {
  bell: icon({ prefix: 'fas', iconName: 'bell' }),
  camera: icon({ prefix: 'fas', iconName: 'camera' }),
  earthAmericas: icon({ prefix: 'fas', iconName: 'earth-americas' }),
  flag: icon({ prefix: 'fas', iconName: 'flag' }),
  house: icon({ prefix: 'fas', iconName: 'house' }),
  doorOpen: icon({ prefix: 'fas', iconName: 'door-open' }),
  doorClosed: icon({ prefix: 'fas', iconName: 'door-closed' }),
  penToSquare: icon({ prefix: 'fas', iconName: 'pen-to-square' }),
  squarePlus: icon({ prefix: 'fas', iconName: 'square-plus' }),
  user: icon({ prefix: 'fas', iconName: 'user' }),
}
