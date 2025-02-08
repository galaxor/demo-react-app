import { Button } from "@nextui-org/button"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useContext } from 'react';
import { Link as Link2 } from "@nextui-org/link"

import icons from './icons.js'
import User from './logic/user.js';
import UserContext from './UserContext';

export default function LogoutLink({}) {
  const { user, setUser, setSessionId } = useContext(UserContext);

  return (
    <Button as={Link2} className="logout" onPress={() => { setSessionId(User.logout()); setUser(null); }} href="/"
      startContent={<FontAwesomeIcon icon={icons.doorClosed} />}
      variant="solid" color="danger" radius="full"
    >
      Log Out
    </Button>
  );

}
