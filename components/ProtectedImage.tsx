"use client";

import React from "react";

interface ProtectedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
}

export default function ProtectedImage({ src, alt, className = "", style, ...rest }: ProtectedImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      draggable={false}
      onContextMenu={(event) => event.preventDefault()}
      onDragStart={(event) => event.preventDefault()}
      onSelect={(event) => event.preventDefault()}
      className={`select-none [user-select:none] [-webkit-user-drag:none] [-webkit-touch-callout:none] ${className}`}
      style={{ ...style, userSelect: "none" }}
      {...rest}
    />
  );
}
