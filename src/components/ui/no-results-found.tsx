import { useRouter } from "@tanstack/react-router";
import { IoArrowBack, IoBan } from "react-icons/io5";

export const NoResultsFound = () => {
  const router = useRouter();

  return (
    <div className={`flex w-full justify-center`}>
      <div
        role="alert"
        className={`alert alert-info alert-soft mt-8 w-65 sm:w-150 md:w-180 lg:w-240 text-xl flex flex-col md:flex-row justify-between`}
      >
        <IoBan className={`size-10`} />
        <span>No results found</span>
        <button
          onClick={() => router.history.back()}
          className={`btn btn-sm lg:btn-md btn-info`}
        >
          <IoArrowBack className={`size-7`} />
          Go back
        </button>
      </div>
    </div>
  );
};
