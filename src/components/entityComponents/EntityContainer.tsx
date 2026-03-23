import { cn } from "@/lib/utils";

type EntityContainerProps = {
  header?: React.ReactNode;
  search?: React.ReactNode;
  pagination?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export const EntityContainer = ({
  header,
  search,
  pagination,
  children,
  className,
}: EntityContainerProps) => {
  return (
    <div className={cn("p-4 md:px-8 lg:px-12 md:py-8 bg-background h-full rounded-b-2xl", className)}>
      <div className="mx-auto max-w-6xl w-full flex flex-col gap-y-8 h-full">
        {header}
        <div className="flex flex-col gap-y-6 h-full">
          {search}
          {children}
        </div>
        {pagination}
      </div>
    </div>
  );
};
