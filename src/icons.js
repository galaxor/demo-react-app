import { library, icon } from '@fortawesome/fontawesome-svg-core'
import { faBell, faCamera, faDoorOpen, faDoorClosed, faPenToSquare } from '@fortawesome/free-solid-svg-icons'

library.add([faBell, faCamera, faDoorOpen, faDoorClosed, faPenToSquare]);

export default {
  bell: icon({ prefix: 'fas', iconName: 'bell' }),
  camera: icon({ prefix: 'fas', iconName: 'camera' }),
  penToSquare: icon({ prefix: 'fas', iconName: 'pen-to-square' }),
  doorOpen: icon({ prefix: 'fas', iconName: 'door-open' }),
  doorClosed: icon({ prefix: 'fas', iconName: 'door-closed' }),
}
