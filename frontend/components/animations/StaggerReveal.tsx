"use client";

import {
  motion,
  Variants,
} from "motion/react";

import {
  ReactNode,
} from "react";

interface AnimationProps {
  children: ReactNode;
  className?: string;
}

/*
|--------------------------------------------------------------------------
| Shared animation variants
|--------------------------------------------------------------------------
*/

const containerVariants: Variants = {
  hidden: {},

  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 24,
    filter: "blur(8px)",
  },

  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",

    transition: {
      duration: 0.65,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

/*
|--------------------------------------------------------------------------
| Page-load stagger
|--------------------------------------------------------------------------
*/

export function StaggerReveal({
  children,
  className,
}: AnimationProps) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: AnimationProps) {
  return (
    <motion.div
      className={className}
      variants={itemVariants}
    >
      {children}
    </motion.div>
  );
}

/*
|--------------------------------------------------------------------------
| Scroll reveal
|--------------------------------------------------------------------------
|
| The animation starts when the element enters
| the viewport.
|
*/

export function ScrollReveal({
  children,
  className,
}: AnimationProps) {
  return (
    <motion.div
      className={className}
      initial={{
        opacity: 0,
        y: 35,
        filter: "blur(8px)",
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      viewport={{
        once: true,
        amount: 0.15,
      }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

/*
|--------------------------------------------------------------------------
| Scroll stagger
|--------------------------------------------------------------------------
|
| Use this around multiple cards/elements.
|
*/

export function ScrollStagger({
  children,
  className,
}: AnimationProps) {
  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{
        once: true,
        amount: 0.15,
      }}
    >
      {children}
    </motion.div>
  );
}

export function ScrollStaggerItem({
  children,
  className,
}: AnimationProps) {
  return (
    <motion.div
      className={className}
      variants={itemVariants}
    >
      {children}
    </motion.div>
  );
}
