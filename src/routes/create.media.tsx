import { createFileRoute } from '@tanstack/react-router'

import { Upload } from '../components/upload'
import { MediaGallery } from '../components/media-gallery'

export const Route = createFileRoute('/create/media')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <div className={`bg-base-300 mb-8 mt-4 rounded-box shadow`}>
        <Upload />
      </div>
      <div className={`bg-base-200 rounded-box shadow`}>
        <MediaGallery />
      </div>
    </>
  )
}
