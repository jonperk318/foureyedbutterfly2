import { createFileRoute } from "@tanstack/react-router";

import Image from "../components/image";
import { trpc } from "../router";
import { useQuery } from "@tanstack/react-query";
import { Spinner } from "../components/spinner";

export const Route = createFileRoute("/posts")({
  component: RouteComponent,
});

export const postYears = ["2025", "2026"]

function RouteComponent() {
  const firstImagesQuery = useQuery(trpc.getFirstImagesOfYears.queryOptions(postYears))

  if (firstImagesQuery.isPending) return <Spinner/>

  const YearImage = ({image}: {image: string | undefined}) => {
    return (
      <>
        {image ? (
          <Image src={`/posts/${image}`} alt={image} className={`max-w-sm`} />
        ) : (
          <Image src="404.jpg" alt="Image not found" className={`max-w-sm`} />
        )}
      </>
    )
  }
  console.log(firstImagesQuery.data)

  return (
    <div className={`flex flex-col items-center justify-center gap-4`}>
      {firstImagesQuery.data && firstImagesQuery.data.map((yearData, i) => (
        <div className={`hero min-h-120`} key={yearData.year}>
          <div className={`hero-content flex-col lg:flex-row gap-16`}>
            {i % 2 === 0 && <YearImage image={yearData.image} />}
            <div>
              <h1 className={`text-5xl text-primary`}>
                The four-eyed butterfly
              </h1>
              <p className={`pt-6`}>This is a blurb</p>
            </div>
            {i % 2 !== 0 && <YearImage image={yearData.image} />}
          </div>
        </div>
      ))}
    </div>
  );
}
