import { Button } from '@nextui-org/button'
import { ToastContainer, toast } from 'react-toastify';

export default function Test() {
  return (
    <div className="grid place-items-center h-dvh bg-zinc-900/15">
      <Button onPress={() => toast("Did it")}>Notify !</Button>
      <ToastContainer />
    </div>
  );
}
