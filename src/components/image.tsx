import { Image as IKImage } from "@imagekit/react";
import { motion } from "motion/react";

type ImageProps = {
  src: string;
  className?: string;
  alt: string;
};

const Image = ({ src, className, alt }: ImageProps) => {
  return (
    <motion.div
      variants={{
        hidden: { clipPath: "circle(0% at -50% 200%)" },
        visible: {
          clipPath: "circle(400% at -50% 200%)",
          transition: { duration: 1 },
        },
      }}
      initial="hidden"
      animate="visible"
    >
      <IKImage
        src={src}
        className={className}
        alt={alt}
        urlEndpoint={import.meta.env.VITE_IK_URL_ENDPOINT}
        loading="lazy"
        lqip={{ active: true, quality: 20 }}
      />
    </motion.div>
  );
};

export default Image;
