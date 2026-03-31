import { SignIn } from "@clerk/react";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/login")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className={`w-full h-max flex justify-center pt-8`}>
      <SignIn />
    </div>
  );
}
