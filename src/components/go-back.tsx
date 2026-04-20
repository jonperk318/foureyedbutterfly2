import { useRouter } from "@tanstack/react-router";
import { IoArrowBack, IoWarning } from "react-icons/io5";

export const GoBack = () => {
  const router = useRouter();

  return (
    <div
      role="alert"
      className={`alert alert-error alert-soft mt-8 w-65 sm:w-150 md:w-180 lg:w-240 text-xl flex flex-col md:flex-row justify-between`}
    >
      <IoWarning className={`size-10`} />
      <span>Only admins can view this!</span>
      <button
        onClick={() => router.history.back()}
        className={`btn btn-sm lg:btn-md btn-error`}
      >
        <IoArrowBack className={`size-7`} />
        Go back
      </button>
    </div>
  );
};
