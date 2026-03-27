import { motion, HTMLMotionProps } from "motion/react";

type FadeInDivProps = {
  delay?: number;
};

const FadeInDiv = ({
  delay,
  children,
  ...props
}: FadeInDivProps & HTMLMotionProps<"div">) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay }}
    layout
    {...props}
  >
    {children}
  </motion.div>
);

export default FadeInDiv;
