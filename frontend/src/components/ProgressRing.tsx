import React from 'react';

interface ProgressRingProps {
  value: string;
  maxLength: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
  value,
  maxLength,
  size = 24,
  strokeWidth = 2,
  className = ''
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value.length / maxLength, 1);
  const strokeDashoffset = circumference - (progress * circumference);

  return (
    <div className={`relative ${className}`}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(156, 163, 175, 0.2)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-300 ease-out"
        />
      </svg>
    </div>
  );
}; 