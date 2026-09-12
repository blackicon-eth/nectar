"use client";

import type { ReactNode } from "react";
import { TransitionRouter } from "next-transition-router";
import { animate, motion } from "motion/react";

export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <TransitionRouter
      auto
      leave={(next) => {
        document.documentElement.style.scrollBehavior = "auto";
        animate(
          "#page-content",
          { opacity: [1, 0] },
          { duration: 0.2, ease: "easeInOut" },
        ).then(next);
      }}
      enter={(next) => {
        animate(
          "#page-content",
          { opacity: [0, 1] },
          { duration: 0.3, ease: "easeInOut" },
        ).then(() => {
          document.documentElement.style.scrollBehavior = "";
          next();
        });
      }}
    >
      <div id="page-content" className="h-full">
        <motion.div
          className="h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          {children}
        </motion.div>
      </div>
    </TransitionRouter>
  );
}
