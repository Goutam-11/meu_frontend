import { SearchIcon, XIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface EntitySearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const EntitySearch = ({
  value,
  onChange,
  placeholder = "Search...",
  className,
}: EntitySearchProps) => {
  return (
    <div className={cn("relative max-w-sm", className)}>
      <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pl-10 pr-10 bg-background border-border focus-visible:ring-ring"
      />
      {value && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 size-7"
          onClick={() => onChange("")}
        >
          <XIcon className="size-3" />
        </Button>
      )}
    </div>
  );
};
