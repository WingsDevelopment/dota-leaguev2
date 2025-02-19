// components/ui/table.tsx
import * as React from "react";
import { cn } from "@/lib/utils"; // Assumes you have a utility to merge class names

export interface TableProps
  extends React.TableHTMLAttributes<HTMLTableElement> {}

export const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, ...props }, ref) => {
    return (
      <table
        ref={ref}
        className={cn(
          "min-w-full border border-gray-200 dark:border-gray-700 table-auto",
          className
        )}
        {...props}
      />
    );
  }
);
Table.displayName = "Table";

export interface TableHeaderProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  TableHeaderProps
>(({ className, ...props }, ref) => {
  return (
    <thead
      ref={ref}
      className={cn("bg-gray-100 dark:bg-gray-800", className)}
      {...props}
    />
  );
});
TableHeader.displayName = "TableHeader";

export interface TableBodyProps
  extends React.HTMLAttributes<HTMLTableSectionElement> {}

export const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  TableBodyProps
>(({ className, ...props }, ref) => {
  return (
    <tbody
      ref={ref}
      className={cn("divide-y divide-gray-200 dark:divide-gray-700", className)}
      {...props}
    />
  );
});
TableBody.displayName = "TableBody";

export interface TableRowProps
  extends React.HTMLAttributes<HTMLTableRowElement> {}

export const TableRow = React.forwardRef<HTMLTableRowElement, TableRowProps>(
  ({ className, ...props }, ref) => {
    return (
      <tr
        ref={ref}
        className={cn("hover:bg-gray-50 dark:hover:bg-gray-700", className)}
        {...props}
      />
    );
  }
);
TableRow.displayName = "TableRow";

export interface TableHeaderCellProps
  extends React.ThHTMLAttributes<HTMLTableCellElement> {}

export const TableHeaderCell = React.forwardRef<
  HTMLTableCellElement,
  TableHeaderCellProps
>(({ className, ...props }, ref) => {
  return (
    <th
      ref={ref}
      className={cn(
        "px-4 py-2 border text-left text-xs font-medium uppercase text-gray-700 dark:text-gray-300",
        className
      )}
      {...props}
    />
  );
});
TableHeaderCell.displayName = "TableHeaderCell";

export interface TableCellProps
  extends React.TdHTMLAttributes<HTMLTableCellElement> {}

export const TableCell = React.forwardRef<HTMLTableCellElement, TableCellProps>(
  ({ className, ...props }, ref) => {
    return (
      <td
        ref={ref}
        className={cn(
          "px-4 py-2 border text-sm text-gray-700 dark:text-gray-300",
          className
        )}
        {...props}
      />
    );
  }
);
TableCell.displayName = "TableCell";
