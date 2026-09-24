interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
  round?: boolean;
}

export function Skeleton({ width = '100%', height = 16, className = '', round = false }: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ width, height, borderRadius: round ? '50%' : undefined }}
    />
  );
}
