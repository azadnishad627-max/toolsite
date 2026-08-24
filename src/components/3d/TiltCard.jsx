import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * 3D Tilt Card with Framer Motion and dynamic specular reflection/glare
 */
export default function TiltCard({ children, className = '', glowColor = 'indigo' }) {
  const cardRef = useRef(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50, opacity: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateXValue = ((y - centerY) / centerY) * -10; // Max 10 deg tilt
    const rotateYValue = ((x - centerX) / centerX) * 10;

    setRotateX(rotateXValue);
    setRotateY(rotateYValue);

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlarePosition({ x: glareX, y: glareY, opacity: 0.15 });
  };

  const handleMouseLeave = () => {
    setRotateX(0);
    setRotateY(0);
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  };

  const glowStyles = {
    indigo: 'hover:border-indigo-500/40 hover:shadow-neon-indigo',
    cyan: 'hover:border-cyan-500/40 hover:shadow-neon-cyan',
    purple: 'hover:border-purple-500/40 hover:shadow-neon-purple',
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      animate={{
        rotateX,
        rotateY,
        transformPerspective: 1000,
      }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`relative rounded-2xl glass-panel overflow-hidden transition-shadow duration-300 ${
        glowStyles[glowColor] || glowStyles.indigo
      } ${className}`}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {/* Specular Glare Effect */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-10"
        style={{
          background: `radial-gradient(circle 350px at ${glarePosition.x}% ${glarePosition.y}%, rgba(255, 255, 255, 0.12), transparent 80%)`,
          opacity: glarePosition.opacity,
        }}
      />
      <div className="relative z-20 h-full">{children}</div>
    </motion.div>
  );
}
