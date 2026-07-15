import React, { useState } from 'react';

interface ImageZoomProps {
  src: string;
  alt: string;
}

export default function ImageZoom({ src, alt }: ImageZoomProps) {
  const [backgroundPosition, setBackgroundPosition] = useState('0% 0%');
  const [showMagnifier, setShowMagnifier] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setBackgroundPosition(`${x}% ${y}%`);
  };

  return (
    <div
      className="relative overflow-hidden cursor-zoom-in aspect-square rounded-2xl bg-slate-950 border border-slate-800"
      onMouseEnter={() => setShowMagnifier(true)}
      onMouseLeave={() => setShowMagnifier(false)}
      onMouseMove={handleMouseMove}
    >
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          showMagnifier ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {showMagnifier && (
        <div
          className="absolute inset-0 bg-no-repeat transition-all duration-75"
          style={{
            backgroundImage: `url(${src})`,
            backgroundPosition: backgroundPosition,
            backgroundSize: '200%', // Magnify 2x
          }}
        />
      )}
    </div>
  );
}
