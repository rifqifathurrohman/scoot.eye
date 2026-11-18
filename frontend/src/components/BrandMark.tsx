import { Link } from "react-router-dom";

interface BrandMarkProps {
  to?: string;
  compact?: boolean;
  className?: string;
}

export default function BrandMark({
  to = "/",
  compact = false,
  className = "",
}: BrandMarkProps) {
  const mark = (
    <img
      src="/scoot-eyewear-wordmark-dark.png"
      alt="SCOOT Eyewear"
      className={`block h-auto w-auto object-contain ${compact ? "max-h-8 max-w-28" : "max-h-12 max-w-40 sm:max-h-14 sm:max-w-48"}`}
    />
  );

  if (to) {
    return (
      <Link
        to={to}
        className={`flex shrink-0 items-center ${className}`}
        aria-label="SCOOT Eyewear, beranda"
      >
        {mark}
      </Link>
    );
  }

  return <div className={`flex shrink-0 items-center ${className}`}>{mark}</div>;
}
