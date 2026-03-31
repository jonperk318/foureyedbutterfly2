import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/posts/$year")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/posts/$year"!</div>;
}
