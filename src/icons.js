import { library, icon } from '@fortawesome/fontawesome-svg-core'
import { faBell, faCamera } from '@fortawesome/free-solid-svg-icons'

library.add([faBell, faCamera]);

export default {
  bell: icon({ prefix: 'fas', iconName: 'bell' }),
  camera: icon({ prefix: 'fas', iconName: 'camera' }),
}
