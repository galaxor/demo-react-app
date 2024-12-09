import * as Toast from "@radix-ui/react-toast";
import "static/toast.css";

export default function Toast({toasts}) {
  return (
    <Toast.Provider swipeDirection="right">
    </Toast.Provider>
  );
}
