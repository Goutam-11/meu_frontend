import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";
import Image from "next/image";

interface EntityAvatarProps {
  icon?: LucideIcon;
  image?: string;
  name?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "primary" | "secondary" | "success" | "warning" | "destructive";
  className?: string;
}

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
};

const iconSizeClasses = {
  sm: "size-4",
  md: "size-5",
  lg: "size-6",
};

const variantClasses = {
  default: "bg-muted text-muted-foreground",
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary text-secondary-foreground",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  destructive: "bg-destructive/10 text-destructive",
};

export const EntityAvatar = ({
  icon: Icon,
  image,
  name,
  size = "md",
  variant = "default",
  className,
}: EntityAvatarProps) => {
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div
      className={cn(
        "rounded-lg flex items-center justify-center font-medium shrink-0",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {image ? (
        <Image
          src={image}
          alt={name || "Avatar"}
          width={20}
          height={20}
          className="size-full object-cover rounded-lg"
        />
      ) : Icon ? (
        <Icon className={iconSizeClasses[size]} />
      ) : (
        initials || "?"
      )}
    </div>
  );
};
