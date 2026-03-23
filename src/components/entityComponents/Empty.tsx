import * as React from "react";
import { cn } from "@/lib/utils";

interface EmptyProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const Empty = React.forwardRef<HTMLDivElement, EmptyProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex flex-col items-center justify-center py-12 px-6 text-center rounded-xl",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
Empty.displayName = "Empty";

export const EmptyHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("mb-4", className)}
    {...props}
  />
));
EmptyHeader.displayName = "EmptyHeader";

interface EmptyMediaProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "icon" | "image";
}

export const EmptyMedia = React.forwardRef<HTMLDivElement, EmptyMediaProps>(
  ({ className, variant = "icon", children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-center",
        variant === "icon" && "w-16 h-16 rounded-full bg-muted text-muted-foreground [&_svg]:w-8 [&_svg]:h-8",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
);
EmptyMedia.displayName = "EmptyMedia";

export const EmptyTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold text-foreground mb-2", className)}
    {...props}
  />
));
EmptyTitle.displayName = "EmptyTitle";

export const EmptyDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground max-w-sm", className)}
    {...props}
  />
));
EmptyDescription.displayName = "EmptyDescription";
