import { Image as IKImage } from "@imagekit/react";

type ImageProps = {
  src: string;
  className: string;
  alt: string;
};

const Image = ({ src, className, alt }: ImageProps) => {
  return (
    <IKImage
      src={src}
      className={className}
      alt={alt}
      urlEndpoint={import.meta.env.VITE_IK_URL_ENDPOINT}
      loading="lazy"
      lqip={{ active: true, quality: 20 }}
    />
  );
};

export default Image;
