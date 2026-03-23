import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVerticalIcon, TrashIcon, EditIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EntityItemProps {
  href?: string;
  title: string;
  subtitle?: React.ReactNode;
  image?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
  isRemoving?: boolean;
  className?: string;
  onRemove?: () => void | Promise<void>;
  onEdit?: () => void;
  onClick?: () => void;
}

export const EntityItem = ({
  href,
  title,
  subtitle,
  image,
  badge,
  actions,
  isRemoving,
  className,
  onRemove,
  onEdit,
  onClick,
}: EntityItemProps) => {
  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isRemoving) return;
    if (onRemove) await onRemove();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onEdit) onEdit();
  };

  const content = (
    <Card
      className={cn(
        "group transition-all duration-200 hover:shadow-md hover:border-primary/20 cursor-pointer border-border",
        isRemoving && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
      onClick={onClick}
    >
      <CardContent className="flex items-center gap-4 p-4 w-full">
        {image && (
          <div className="shrink-0">
            {image}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
              {title}
            </h3>
            {badge}
          </div>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1 wrap-break-word">
              {subtitle}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {actions}
          {(onRemove || onEdit) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="ghost"
                  className="size-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVerticalIcon className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover">
                {onEdit && (
                  <DropdownMenuItem onClick={handleEdit} className="gap-2">
                    <EditIcon className="size-4" />
                    Edit
                  </DropdownMenuItem>
                )}
                {onRemove && (
                  <DropdownMenuItem
                    onClick={handleRemove}
                    className="gap-2 text-destructive focus:text-destructive"
                  >
                    <TrashIcon className="size-4" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
};
