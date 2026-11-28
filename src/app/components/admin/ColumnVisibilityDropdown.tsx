import { Columns3 } from 'lucide-react';
import { Button } from '@components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@components/ui/dropdown-menu';
import { cn } from '@components/ui/utils';

export interface ColumnOption<K extends string = string> {
    key: K;
    label: string;
}

export function createDefaultColumnVisibility<K extends string>(
    columns: readonly ColumnOption<K>[]
): Record<K, boolean> {
    return columns.reduce((acc, col) => {
        acc[col.key] = true;
        return acc;
    }, {} as Record<K, boolean>);
}

export function escapeCsvCell(value: unknown): string {
    const str = value === null || value === undefined ? '' : String(value);
    return `"${str.replace(/"/g, '""')}"`;
}

interface ColumnVisibilityDropdownProps<K extends string> {
    columns: readonly ColumnOption<K>[];
    visibleColumns: Record<K, boolean>;
    onToggleColumn: (key: K) => void;
    onShowAll?: () => void;
    className?: string;
}

export function ColumnVisibilityDropdown<K extends string>({
    columns,
    visibleColumns,
    onToggleColumn,
    onShowAll,
    className,
}: ColumnVisibilityDropdownProps<K>) {
    const visibleCount = columns.filter((col) => visibleColumns[col.key]).length;
    const hiddenCount = columns.length - visibleCount;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className={cn(
                        'gap-2 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 shrink-0',
                        className
                    )}
                >
                    <Columns3 className="h-4 w-4" />
                    <span>Columns</span>
                    {hiddenCount > 0 && (
                        <span className="rounded-full bg-brand-primary/15 px-1.5 py-0.5 text-xs font-semibold text-brand-primary">
                            {visibleCount}/{columns.length}
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                align="end"
                className="w-56 bg-white border border-gray-200 shadow-md"
            >
                <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                    Toggle Columns
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {columns.map((col) => {
                    const isVisible = visibleColumns[col.key];
                    const isLastVisible = isVisible && visibleCount <= 1;
                    return (
                        <DropdownMenuCheckboxItem
                            key={col.key}
                            checked={isVisible}
                            disabled={isLastVisible}
                            title={
                                isLastVisible
                                    ? 'At least one column must remain visible'
                                    : undefined
                            }
                            onSelect={(e) => e.preventDefault()}
                            onCheckedChange={() => onToggleColumn(col.key)}
                            className="cursor-pointer"
                        >
                            {col.label}
                        </DropdownMenuCheckboxItem>
                    );
                })}
                {hiddenCount > 0 && onShowAll && (
                    <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onSelect={(e) => {
                                e.preventDefault();
                                onShowAll();
                            }}
                            className="justify-center text-xs font-medium text-brand-primary focus:text-brand-primary cursor-pointer"
                        >
                            Show all columns
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
