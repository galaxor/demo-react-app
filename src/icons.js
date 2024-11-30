import { library, icon } from '@fortawesome/fontawesome-svg-core'
import { faBell, faCamera, faDoorOpen, faDoorClosed, faEarthAmericas, faHouse, faPenToSquare } from '@fortawesome/free-solid-svg-icons'

library.add([faBell, faCamera, faDoorOpen, faDoorClosed, faEarthAmericas, faHouse, faPenToSquare]);

export default {
  bell: icon({ prefix: 'fas', iconName: 'bell' }),
  camera: icon({ prefix: 'fas', iconName: 'camera' }),
  earthAmericas: icon({ prefix: 'fas', iconName: 'earth-americas' }),
  penToSquare: icon({ prefix: 'fas', iconName: 'pen-to-square' }),
  house: icon({ prefix: 'fas', iconName: 'house' }),
  doorOpen: icon({ prefix: 'fas', iconName: 'door-open' }),
  doorClosed: icon({ prefix: 'fas', iconName: 'door-closed' }),
}
