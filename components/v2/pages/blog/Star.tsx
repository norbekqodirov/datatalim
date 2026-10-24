import React from 'react';

export const STAR_PATH =
  'M28.06.91l2.46,10.03c1.5,6.09,6.25,10.85,12.35,12.35l10.03,2.46c1.21.3,1.21,2.02,0,2.31l-10.03,2.46c-6.09,1.5-10.85,6.25-12.35,12.35l-2.46,10.03c-.3,1.21-2.02,1.21-2.31,0l-2.46-10.03c-1.5-6.09-6.25-10.85-12.35-12.35L.91,28.06c-1.21-.3-1.21-2.02,0-2.31l10.03-2.46c6.09-1.5,10.85-6.25,12.35-12.35L25.75.91c.3-1.21,2.02-1.21,2.31,0Z';

/** The DATA 4-point star as a plain SVG (fill or outline). */
export const Star4: React.FC<{ className?: string; style?: React.CSSProperties; fill?: string; stroke?: string; strokeWidth?: number }> = ({
  className,
  style,
  fill = 'currentColor',
  stroke,
  strokeWidth = 1,
}) => (
  <svg className={className} style={style} viewBox="0 0 53.82 53.82" aria-hidden="true" focusable="false">
    <path d={STAR_PATH} fill={fill} stroke={stroke} strokeWidth={stroke ? strokeWidth : 0} vectorEffect="non-scaling-stroke" />
  </svg>
);
