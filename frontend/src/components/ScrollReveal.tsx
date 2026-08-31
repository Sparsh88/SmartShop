import React, { ReactNode } from 'react';
import { motion, useReducedMotion, Variants } from 'framer-motion';

// Smooth custom cubic-bezier ease matching portfolio websites
export const DEFAULT_EASE = [0.22, 1, 0.36, 1];

export interface ScrollRevealProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  duration?: number;
  delay?: number;
  threshold?: number;
  scale?: number;
  blur?: boolean;
  once?: boolean;
  style?: React.CSSProperties;
  id?: string;
}

export const getRevealVariants = (
  direction: 'up' | 'down' | 'left' | 'right' | 'none' = 'up',
  distance: number = 35,
  scale?: number,
  blur?: boolean,
  duration: number = 0.7,
  delay: number = 0
): Variants => {
  let initialX = 0;
  let initialY = 0;

  if (direction === 'up') initialY = distance;
  else if (direction === 'down') initialY = -distance;
  else if (direction === 'left') initialX = distance;
  else if (direction === 'right') initialX = -distance;

  return {
    hidden: {
      opacity: 0,
      x: initialX,
      y: initialY,
      scale: scale !== undefined ? scale : 1,
      filter: blur ? 'blur(8px)' : 'none',
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      filter: 'none',
      transition: {
        duration,
        delay,
        ease: DEFAULT_EASE,
      },
    },
  };
};

/**
 * Standard single-element or section scroll reveal component.
 * Automatically triggers when the element enters the viewport.
 */
export function ScrollReveal({
  children,
  className = '',
  direction = 'up',
  distance = 35,
  duration = 0.7,
  delay = 0,
  threshold = 0.15,
  scale,
  blur = false,
  once = true,
  style,
  id,
}: ScrollRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={className} style={style} id={id}>
        {children}
      </div>
    );
  }

  const variants = getRevealVariants(direction, distance, scale, blur, duration, delay);

  return (
    <motion.div
      id={id}
      className={className}
      style={style}
      variants={variants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
    >
      {children}
    </motion.div>
  );
}

// ----------------------------------------------------------------------
// Stagger Container & Child Item Components
// ----------------------------------------------------------------------

export interface ScrollRevealGroupProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
  threshold?: number;
  once?: boolean;
  style?: React.CSSProperties;
  id?: string;
}

export const staggerContainerVariants = (
  staggerDelay: number = 0.12,
  delayChildren: number = 0.05
): Variants => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: staggerDelay,
      delayChildren: delayChildren,
    },
  },
});

/**
 * Parent container that orchestrates a cascading stagger reveal across all child `ScrollRevealItem`s.
 */
export function ScrollRevealGroup({
  children,
  className = '',
  staggerDelay = 0.12,
  delayChildren = 0.05,
  threshold = 0.1,
  once = true,
  style,
  id,
}: ScrollRevealGroupProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={className} style={style} id={id}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      id={id}
      className={className}
      style={style}
      variants={staggerContainerVariants(staggerDelay, delayChildren)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount: threshold }}
    >
      {children}
    </motion.div>
  );
}

export interface ScrollRevealItemProps {
  children: ReactNode;
  className?: string;
  direction?: 'up' | 'down' | 'left' | 'right' | 'none';
  distance?: number;
  duration?: number;
  scale?: number;
  style?: React.CSSProperties;
  id?: string;
}

export const staggerItemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 35,
    scale: 0.97,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.65,
      ease: DEFAULT_EASE,
    },
  },
};

/**
 * Child item component placed inside `ScrollRevealGroup`.
 * Automatically inherits staggered entrance timings from the parent group.
 */
export function ScrollRevealItem({
  children,
  className = '',
  direction = 'up',
  distance = 35,
  duration = 0.65,
  scale = 0.97,
  style,
  id,
}: ScrollRevealItemProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return (
      <div className={className} style={style} id={id}>
        {children}
      </div>
    );
  }

  let initialX = 0;
  let initialY = 0;
  if (direction === 'up') initialY = distance;
  else if (direction === 'down') initialY = -distance;
  else if (direction === 'left') initialX = distance;
  else if (direction === 'right') initialX = -distance;

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      x: initialX,
      y: initialY,
      scale: scale ?? 1,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
      scale: 1,
      transition: {
        duration,
        ease: DEFAULT_EASE,
      },
    },
  };

  return (
    <motion.div
      id={id}
      className={className}
      style={style}
      variants={itemVariants}
    >
      {children}
    </motion.div>
  );
}

// ----------------------------------------------------------------------
// Reusable Named Variants for Direct Framer Motion `motion.*` Usage
// ----------------------------------------------------------------------

export const fadeUpVariant: Variants = {
  hidden: { opacity: 0, y: 35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: DEFAULT_EASE },
  },
};

export const fadeDownVariant: Variants = {
  hidden: { opacity: 0, y: -35 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: DEFAULT_EASE },
  },
};

export const fadeInLeftVariant: Variants = {
  hidden: { opacity: 0, x: -35 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: DEFAULT_EASE },
  },
};

export const fadeInRightVariant: Variants = {
  hidden: { opacity: 0, x: 35 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: DEFAULT_EASE },
  },
};

export const zoomInVariant: Variants = {
  hidden: { opacity: 0, scale: 0.94, y: 25 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.7, ease: DEFAULT_EASE },
  },
};

export const defaultViewport = {
  once: true,
  amount: 0.15,
};

export default ScrollReveal;
