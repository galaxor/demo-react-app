import { library, icon } from '@fortawesome/fontawesome-svg-core'
import { faBell, faCamera, faPenToSquare } from '@fortawesome/free-solid-svg-icons'

library.add([faBell, faCamera, faPenToSquare]);

export default {
  bell: icon({ prefix: 'fas', iconName: 'bell' }),
  camera: icon({ prefix: 'fas', iconName: 'camera' }),
  penToSquare: icon({ prefix: 'fas', iconName: 'pen-to-square' }),
}
