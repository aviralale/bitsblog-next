import { Clock } from "lucide-react";

interface ReadingTimeProps {
  minutes: number;
  className?: string;
}

export function ReadingTime({ minutes, className = "" }: ReadingTimeProps) {
  return (
    <div
      className={`flex items-center gap-1.5 text-sm text-neutral-600 dark:text-neutral-400 ${className}`}
      aria-label={`Estimated reading time: ${minutes} ${minutes === 1 ? "minute" : "minutes"}`}
    >
      <Clock className="w-4 h-4" aria-hidden="true" />
      <span>{minutes} min read</span>
    </div>
  );
}
