'use client';

import { motion } from 'framer-motion';
import React, { useEffect, useRef, useState } from 'react';

interface AnimatedTrailProps {
  words: string;
  gradientColors: string[];
}

const AnimatedTrail: React.FC<AnimatedTrailProps> = ({
  words,
  gradientColors,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [path, setPath] = useState('');
  const [dots, setDots] = useState<{ x: number; y: number }[]>([]);

  useEffect(() => {
    if (svgRef.current) {
      const width = svgRef.current.clientWidth;
      const height = svgRef.current.clientHeight;

      // Generate background dots
      const spacing = 20; // Adjust this value to change dot density
      const newDots = [];
      for (let x = 0; x < width; x += spacing) {
        for (let y = 0; y < height; y += spacing) {
          newDots.push({ x, y });
        }
      }
      setDots(newDots);

      // Generate path for the words
      const centerX = width / 2;
      const centerY = height / 2;
      const pathWidth = width * 0.6; // Adjust this value to change word width
      const pathHeight = height * 0.2; // Adjust this value to change word height
      const letterSpacing = pathWidth / words.length;

      let newPath = `M${centerX - pathWidth / 2},${centerY} `;
      words.split('').forEach((char, index) => {
        const x = centerX - pathWidth / 2 + letterSpacing * index;
        const y = centerY + Math.sin(index * 0.5) * (pathHeight / 4);
        newPath += `L${x},${y} `;
      });
      setPath(newPath);
    }
  }, [words]);

  const pathVariants = {
    initial: { pathLength: 0, pathOffset: 0 },
    animate: {
      pathLength: 0.2,
      pathOffset: 1,
      transition: { duration: 5, repeat: Infinity, ease: 'linear' },
    },
  };

  return (
    <svg
      ref={svgRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="trailGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          {gradientColors.map((color, index) => (
            <stop
              key={index}
              offset={`${(index / (gradientColors.length - 1)) * 100}%`}
              stopColor={color}
            />
          ))}
        </linearGradient>
      </defs>

      {dots.map((dot, index) => (
        <circle
          key={index}
          cx={dot.x}
          cy={dot.y}
          r={0.5}
          fill="#000"
          opacity={0.1}
        />
      ))}

      <motion.path
        d={path}
        stroke="url(#trailGradient)"
        strokeWidth={4}
        fill="none"
        variants={pathVariants}
        initial="initial"
        animate="animate"
      />
    </svg>
  );
};

export default AnimatedTrail;
