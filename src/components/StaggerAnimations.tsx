import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface StaggerProps {
  children: ReactNode;
  className?: string;
  delay?: number;
}

export function StaggerContainer({ children, className, delay = 0 }: StaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: 0.06,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      variants={{
        hidden: { opacity: 0, y: 16, scale: 0.97 },
        visible: {
          opacity: 1,
          y: 0,
          scale: 1,
          transition: { type: "spring", stiffness: 300, damping: 24 },
        },
      }}
    >
      {children}
    </motion.div>
  );
}
