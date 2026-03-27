import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$year/$postId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/posts/$year/$postId"!</div>
}
