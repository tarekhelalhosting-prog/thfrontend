"use client";

import React from "react";
import ProtectedImage from "./ProtectedImage";

interface ImageProtectorProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export default function ImageProtector({ src, alt, className = "", style, ...rest }: ImageProtectorProps) {
  return (
    <div
      className="relative overflow-hidden"
      onContextMenu={(event) => event.preventDefault()}
      onMouseDown={(event) => {
        if (event.button === 2) {
          event.preventDefault();
        }
      }}
    >
      <ProtectedImage
        src={src}
        alt={alt}
        className={className}
        style={style}
        {...rest}
      />
      {/* Transparent overlay that blocks direct image access (open image, save image, copy image address). */}
      <div
        className="pointer-events-auto absolute inset-0 z-10 bg-transparent"
        aria-hidden="true"
      />
    </div>
  );
}
