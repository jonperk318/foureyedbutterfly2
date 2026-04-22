import { Toaster } from "react-hot-toast";
import { IoIosCheckmarkCircle } from "react-icons/io";
import { IoWarning } from "react-icons/io5";

export const CustomToaster = () => {
  return (
    <Toaster
      position="bottom-center"
      toastOptions={{
        duration: 5000,
        style: {
          background: "var(--color-base-300)",
          color: "var(--color-base-content)",
        },
        success: {
          icon: <IoIosCheckmarkCircle className={`text-success size-7`} />,
        },
        error: {
          icon: <IoWarning className={`text-error min-w-12`} />,
        },
      }}
    />
  );
};
