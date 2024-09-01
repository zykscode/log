'use client';

import { motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

interface AnimatedBackgroundProps {
  speed?: number;
  color?: string;
  opacity?: number;
}

export default function AnimatedBackground({
  speed = 1,
  color = 'white',
  opacity = 1,
}: AnimatedBackgroundProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dots, setDots] = useState<{ x: number; y: number }[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        setDimensions({ width, height });
        const spacing = 20;
        const newDots = [];
        for (let x = 0; x < width; x += spacing) {
          for (let y = 0; y < height; y += spacing) {
            newDots.push({ x, y });
          }
        }
        setDots(newDots);
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const letterWidth = Math.min(dimensions.width * 0.15, 150);
  const letterHeight = letterWidth * 1.5;
  const gap = letterWidth * 0.5;
  const totalWidth = letterWidth * 3 + gap * 2;
  const centerX = dimensions.width / 2;
  const centerY = dimensions.height / 2;
  const startX = centerX - totalWidth / 2;

  const zPath = `M${startX},${centerY - letterHeight / 2} L${startX + letterWidth},${centerY - letterHeight / 2} L${startX},${centerY + letterHeight / 2} L${startX + letterWidth},${centerY + letterHeight / 2}`;
  const yPath = `M${startX + letterWidth + gap},${centerY - letterHeight / 2} L${startX + letterWidth + gap + letterWidth / 2},${centerY} L${startX + letterWidth + gap + letterWidth / 2},${centerY + letterHeight / 2} M${startX + letterWidth + gap + letterWidth},${centerY - letterHeight / 2} L${startX + letterWidth + gap + letterWidth / 2},${centerY}`;
  const kPath = `M${startX + letterWidth * 2 + gap * 2},${centerY - letterHeight / 2} L${startX + letterWidth * 2 + gap * 2},${centerY + letterHeight / 2} M${startX + letterWidth * 2 + gap * 2},${centerY} L${startX + letterWidth * 3 + gap * 2},${centerY - letterHeight / 2} M${startX + letterWidth * 2 + gap * 2},${centerY} L${startX + letterWidth * 3 + gap * 2},${centerY + letterHeight / 2}`;

  const pathVariants = {
    initial: { pathLength: 0, pathOffset: 0 },
    animate: {
      pathLength: [0.05, 0.05],
      pathOffset: [0, 1],
      transition: {
        duration: 6 / speed,
        ease: 'linear',
        repeat: Infinity,
      },
    },
  };

  return (
    <svg
      ref={svgRef}
      className="absolute  -z-40 w-full h-full"
      xmlns="http://www.w3.org/2000/svg"
    >
      {dots.map((dot, index) => (
        <circle
          key={index}
          cx={dot.x}
          cy={dot.y}
          r={1}
          fill="#000"
          opacity={0.3}
        />
      ))}

      <motion.path
        d={zPath}
        stroke={color}
        strokeWidth={6}
        fill="none"
        filter="url(#glow)"
        variants={pathVariants}
        initial="initial"
        animate="animate"
        opacity={opacity}
      />

      <motion.path
        d={yPath}
        stroke={color}
        strokeWidth={6}
        fill="none"
        filter="url(#glow)"
        variants={pathVariants}
        initial="initial"
        animate="animate"
        opacity={opacity}
      />

      <motion.path
        d={kPath}
        stroke={color}
        strokeWidth={6}
        fill="none"
        filter="url(#glow)"
        variants={pathVariants}
        initial="initial"
        animate="animate"
        opacity={opacity}
      />

      <motion.path
        d={`${zPath} ${yPath} ${kPath}`}
        stroke={color}
        strokeWidth={6}
        fill="none"
        filter="url(#glow)"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          duration: 6 / speed,
          ease: 'linear',
          repeat: Infinity,
          repeatType: 'loop',
        }}
        opacity={opacity * 0.5}
      />

      <defs>
        <filter id="glow">
          <feGaussianBlur stdDeviation="4" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
    </svg>
  );
}
