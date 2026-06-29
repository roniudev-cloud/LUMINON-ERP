import {
  type ColumnDef,
  type ColumnFiltersState,
  type Header,
  type SortingState,
  type VisibilityState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import * as React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./data-table-pagination";
import { DataTableToolbar } from "./data-table-toolbar";
import { cn } from "@/lib/utils";

/** Lấy nhãn tiếng Việt của cột cho danh sách box mobile — đọc prop `title` của
 * <DataTableColumnHeader title="..."/> nếu header là component đó, nếu không thì
 * render header bình thường (vẫn đúng nội dung, có thể kèm icon sort nhỏ). */
function getColumnLabel<TData, TValue>(
  column: { id: string; columnDef: ColumnDef<TData, TValue> },
  header: Header<TData, TValue> | undefined
): React.ReactNode {
  const headerDef = column.columnDef.header;
  if (typeof headerDef === "string") return headerDef;
  if (typeof headerDef === "function" && header) {
    try {
      const el = headerDef(header.getContext() as any) as any;
      if (el?.props?.title) return el.props.title;
    } catch {
      // fall through
    }
  }
  return header ? flexRender(column.columnDef.header, header.getContext()) : column.id;
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  onRowClick?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Tìm kiếm...",
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const [rowSelection, setRowSelection] = React.useState({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  });

  return (
    <div className="space-y-4">
      <DataTableToolbar
        table={table}
        searchKey={searchKey}
        searchPlaceholder={searchPlaceholder}
      />
      {/* Desktop: bảng thật. Mobile (<md): danh sách box, không trượt ngang. */}
      <div className="hidden md:block rounded-xl border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  onClick={() => onRowClick && onRowClick(row.original)}
                  className={onRowClick ? "cursor-pointer hover:bg-muted/50" : ""}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Không có dữ liệu.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="md:hidden space-y-3">
        {table.getRowModel().rows?.length ? (
          table.getRowModel().rows.map((row) => {
            const cells = row.getVisibleCells();
            const [titleCell, ...restCells] = cells;
            const headersById = Object.fromEntries(
              (table.getHeaderGroups()[0]?.headers ?? []).map((h) => [h.column.id, h])
            );
            return (
              <div
                key={row.id}
                onClick={() => onRowClick && onRowClick(row.original)}
                className={cn(
                  "rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-colors",
                  onRowClick && "cursor-pointer active:bg-muted/50 hover:border-border/80"
                )}
              >
                {titleCell && (
                  <div className="font-semibold text-base mb-3 pb-3 border-b border-dashed border-border/60">
                    {flexRender(titleCell.column.columnDef.cell, titleCell.getContext())}
                  </div>
                )}
                <div className="space-y-1.5">
                  {restCells.map((cell) => {
                    const label = getColumnLabel(cell.column, headersById[cell.column.id]);
                    return (
                      <div key={cell.id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-muted-foreground shrink-0">{label}</span>
                        <span className="text-right min-w-0 truncate">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-center text-sm text-muted-foreground py-10">Không có dữ liệu.</p>
        )}
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}
