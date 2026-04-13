import { createFileRoute } from "@tanstack/react-router";
import toast from "react-hot-toast";

export const Route = createFileRoute("/posts")({
  component: RouteComponent,
});

function RouteComponent() {
  const onToast = () => {
    toast.success("Here is a message");
  };

  return (
    <div>
      <button className="btn" onClick={onToast}>
        Toast
      </button>
    </div>
  );
}
