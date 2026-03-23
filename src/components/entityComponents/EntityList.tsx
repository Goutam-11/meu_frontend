import { cn } from "@/lib/utils";

interface EntityListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  getKey: (item: T, index: number) => string | number;
  emptyView?: React.ReactNode;
  className?: string;
  variant?: "list" | "grid";
}

export function EntityList<T>({
  items,
  renderItem,
  getKey,
  emptyView,
  className,
  variant = "list",
}: EntityListProps<T>) {
  if (items.length === 0 && emptyView) {
    return (
      <div className="flex-1 flex justify-center items-center">
        {emptyView}
      </div>
    );
  }

  return (
    <div
      className={cn(
        variant === "list" && "flex flex-col gap-3",
        variant === "grid" && "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4",
        className
      )}
    >
      {items.map((item, index) => (
        <div key={getKey(item, index)}>{renderItem(item, index)}</div>
      ))}
    </div>
  );
}
