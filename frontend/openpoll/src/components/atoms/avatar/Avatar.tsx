import { User } from "lucide-react";

interface AvatarProps {
  size?: "sm" | "md" | "lg" | "xl";
  src?: string;
  name?: string;
  className?: string;
}

const sizeMap = {
  sm: { container: "w-8 h-8", icon: "w-4 h-4", text: "text-xs" },
  md: { container: "w-10 h-10 sm:w-12 sm:h-12", icon: "w-5 h-5 sm:w-6 sm:h-6", text: "text-sm" },
  lg: { container: "w-16 h-16 sm:w-20 sm:h-20", icon: "w-8 h-8", text: "text-xl" },
  xl: { container: "w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32", icon: "w-10 h-10 sm:w-12 sm:h-12", text: "text-2xl" },
};

export function Avatar({ size = "md", src, name, className = "" }: AvatarProps) {
  const s = sizeMap[size];

  if (src) {
    return (
      <img
        src={src}
        alt={name || "사용자 아바타"}
        className={`${s.container} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${s.container} rounded-full flex items-center justify-center shrink-0 bg-primary ${className}`}
      role="img"
      aria-label={name || "사용자 아바타"}
    >
      {name ? (
        <span className={`font-bold ${s.text} text-primary-fg`}>
          {name.charAt(0).toUpperCase()}
        </span>
      ) : (
        <User className={`${s.icon} text-primary-fg`} />
      )}
    </div>
  );
}
