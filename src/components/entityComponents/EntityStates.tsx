import { AlertTriangleIcon, Loader2Icon, PackageOpenIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "./Empty";
import { PlusIcon } from "lucide-react";

interface StateViewProps {
  message?: string;
}

export const LoadingView = ({ message = "Loading..." }: StateViewProps) => {
  return (
    <div className="flex items-center justify-center flex-1 min-h-[300px]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
          <div className="relative rounded-full bg-primary/10 p-4">
            <Loader2Icon className="size-6 text-primary animate-spin" />
          </div>
        </div>
        <p className="text-sm text-muted-foreground animate-pulse">{message}</p>
      </div>
    </div>
  );
};

export const ErrorView = ({ message = "Something went wrong" }: StateViewProps) => {
  return (
    <div className="flex items-center justify-center flex-1 min-h-[300px]">
      <div className="flex flex-col items-center gap-4">
        <div className="rounded-full bg-destructive/10 p-4">
          <AlertTriangleIcon className="size-6 text-destructive" />
        </div>
        <div className="text-center">
          <p className="text-sm font-medium text-foreground">Error</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
};

interface EmptyViewProps extends StateViewProps {
  title?: string;
  onNew?: () => void;
  newButtonLabel?: string;
}

export const EmptyView = ({ 
  title = "No items found",
  message, 
  onNew,
  newButtonLabel = "Create new"
}: EmptyViewProps) => {
  return (
    <Empty className="border border-dashed border-border bg-muted/30 min-h-[300px]">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <PackageOpenIcon />
        </EmptyMedia>
      </EmptyHeader>
      <EmptyTitle>{title}</EmptyTitle>
      {message && <EmptyDescription>{message}</EmptyDescription>}
      {onNew && (
        <div className="mt-4">
          <Button onClick={onNew} variant="outline" className="gap-2">
            <PlusIcon className="size-4" />
            {newButtonLabel}
          </Button>
        </div>
      )}
    </Empty>
  );
};
