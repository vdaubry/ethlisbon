import { toast } from "react-toastify";

/**************************************
 *
 * UI Helpers
 *
 **************************************/

export const handleSuccessNotification = () => {
  toast.success("Transaction completed !"),
    {
      position: toast.POSITION.TOP_RIGHT
    };
};

export const handleFailureNotification = msg => {
  toast.error(msg),
    {
      position: toast.POSITION.TOP_RIGHT
    };
};
