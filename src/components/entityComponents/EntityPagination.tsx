import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";

interface EntityPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export const EntityPagination = ({
  page,
  totalPages,
  onPageChange,
  disabled,
}: EntityPaginationProps) => {
  return (
    <div className="flex items-center justify-between gap-x-4 pt-4 border-t border-border">
      <p className="text-sm text-muted-foreground">
        Page <span className="font-medium text-foreground">{page}</span> of{" "}
        <span className="font-medium text-foreground">{totalPages || 1}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          disabled={disabled || page === 1}
          onClick={() => onPageChange(Math.max(1, page - 1))}
          variant="outline"
          size="sm"
          className="gap-1"
        >
          <ChevronLeftIcon className="size-4" />
          Previous
        </Button>
        <Button
          disabled={disabled || page === totalPages || totalPages === 0}
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          variant="outline"
          size="sm"
          className="gap-1"
        >
          Next
          <ChevronRightIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
};
