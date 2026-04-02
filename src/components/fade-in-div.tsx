import { motion, HTMLMotionProps } from "motion/react";
import { useState } from "react";

type FadeInDivProps = {
  initialDelay?: number;
};

const FadeInDiv = ({
  initialDelay,
  children,
  ...props
}: FadeInDivProps & HTMLMotionProps<"div">) => {

  const [delay, setDelay] = useState<number | undefined>(initialDelay);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      onAnimationComplete={() => setDelay(0)}
      layout
      {...props}
    >
      {children}
    </motion.div>
  )
};

export default FadeInDiv;
