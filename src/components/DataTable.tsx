import * as React from "react";
import {
    type ColumnDef as BaseColumnDef,
    type ColumnFiltersState,
    type RowSelectionState,
    type SortingState,
    type VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { ChevronDown, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectTrigger,
    SelectContent,
    SelectItem,
    SelectValue,
} from "@/components/ui/select";

type ColumnDef<TData> = BaseColumnDef<TData> & {
    customClassName?: string;
};

type DataTableProps<TData> = {
    data: TData[];
    columns: ColumnDef<TData>[];
    rowSelection?: RowSelectionState; // Added rowSelection as a prop
    onRowSelectionChange?: (rowSelection: RowSelectionState) => void; // Callback for row selection changes
};

export function DataTable<TData>({
    data,
    columns,
    rowSelection,
    onRowSelectionChange,
    isCheckboxEnabled = false,
    isPaginationRequired = true,
    // defaultPageSize = 100
}: DataTableProps<TData> & { isCheckboxEnabled?: boolean; isPaginationRequired?: boolean; defaultPageSize?: number }) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [pagination, setPagination] = React.useState({
        pageSize: isPaginationRequired ? 10 : 100,
        pageIndex: 0,
    });

    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination
        },

        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: (updaterOrValue) => {
            const newValue =
                typeof updaterOrValue === "function"
                    ? updaterOrValue(rowSelection as RowSelectionState)
                    : updaterOrValue;

            onRowSelectionChange && onRowSelectionChange(newValue); // Properly update the row selection
        },
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
    });

    function highlightText(text: string, query: string): React.ReactNode {
        if (!query) return text;

        const parts = text.split(new RegExp(`(${query})`, "gi"));
        return parts.map((part, index) =>
            part.toLowerCase() === query.toLowerCase() ? (
                <span key={index + 1} className="bg-yellow-300">
                    {part}
                </span>
            ) : (
                part
            )
        );
    }

    return (
        <div className="w-full">
            {/* Search and Column Visibility */}
           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-4">
  {isPaginationRequired && (
    <Input
      placeholder="Search..."
      value={(table.getState().globalFilter as string) ?? ""}
      onChange={(e) => table.setGlobalFilter(e.target.value || undefined)}
      className="w-full sm:max-w-sm border-neutral-800"
    />
  )}

  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant="outline" className="sm:ml-auto w-full sm:w-auto">
        Columns <ChevronDown className="ml-2" />
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {table
        .getAllColumns()
        .filter((column) => column.getCanHide())
        .map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            className="capitalize"
            checked={column.getIsVisible()}
            onCheckedChange={(value) => column.toggleVisibility(!!value)}
          >
            {column.id}
          </DropdownMenuCheckboxItem>
        ))}
    </DropdownMenuContent>
  </DropdownMenu>
</div>


            {/* Table */}
<div className="rounded-lg border overflow-x-auto">
  <Table className="min-w-full text-sm">
    <TableHeader>
      {table.getHeaderGroups().map((headerGroup) => (
        <TableRow key={headerGroup.id}>
          {headerGroup.headers.map((header, index) => (
            <TableHead
              className={`bg-neutral-800 text-white whitespace-nowrap px-4 py-2 text-left ${
                index === 0 ? 'rounded-ss-lg' : ''
              } ${index === headerGroup.headers.length - 1 ? 'rounded-se-lg' : ''} ${
                (header.column.columnDef as ColumnDef<TData>).customClassName || ''
              }`}
              key={header.id}
              onClick={() => header.column.toggleSorting()}
            >
              {header.isPlaceholder ? null : (
                <div className="flex items-center cursor-pointer">
                  {flexRender(header.column.columnDef.header, header.getContext())}
                  {header.column.getIsSorted() === 'asc' && (
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  )}
                  {header.column.getIsSorted() === 'desc' && (
                    <ArrowUpDown className="ml-2 h-4 w-4 rotate-180" />
                  )}
                </div>
              )}
            </TableHead>
          ))}
        </TableRow>
      ))}
    </TableHeader>
    <TableBody>
      {table.getRowModel().rows?.length ? (
        table.getRowModel().rows.map((row) => (
          <TableRow
            key={row.id}
            data-state={isCheckboxEnabled && row.getIsSelected() ? 'selected' : undefined}
          >
            {row.getVisibleCells().map((cell) => {
              const globalFilterValue = table.getState().globalFilter || '';
              return (
                <TableCell key={cell.id} className="px-4 py-2 whitespace-nowrap break-words">
                  {cell.getValue() !== null && cell.getValue() !== undefined ? (
                    highlightText(String(cell.getValue()), globalFilterValue)
                  ) : (
                    flexRender(cell.column.columnDef.cell, cell.getContext())
                  )}
                </TableCell>
              );
            })}
          </TableRow>
        ))
      ) : (
        <TableRow>
          <TableCell colSpan={columns.length} className="h-24 text-center">
            No records found.
          </TableCell>
        </TableRow>
      )}
    </TableBody>
  </Table>
</div>

{/* Pagination */}
{isPaginationRequired && (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4">
    {/* Rows Per Page Selector */}
    <div className="flex items-center space-x-2 text-sm">
      <span>Rows per page:</span>
      <Select
        value={String(table.getState().pagination.pageSize)}
        onValueChange={(value) =>
          setPagination((prev) => ({ ...prev, pageSize: Number(value) }))
        }
      >
        <SelectTrigger className="w-20 text-sm">
          <SelectValue placeholder="Rows" />
        </SelectTrigger>
        <SelectContent>
          {[5, 10, 20, 50].map((pageSize) => (
            <SelectItem key={pageSize} value={String(pageSize)}>
              {pageSize}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>

    {/* Page Info */}
    <div className="flex items-center gap-2 text-sm">
      <p>Page</p>
      <Input
        readOnly
        type="text"
        value={table.getState().pagination.pageIndex + 1}
        className="w-12 text-center"
      />
      <p>of</p>
      <Input
        readOnly
        type="text"
        value={Math.ceil(data.length / table.getState().pagination.pageSize)}
        className="w-14 text-center"
      />
    </div>

    {/* Pagination Controls */}
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="cursor-pointer"
        onClick={() =>
          setPagination((prev) => ({
            ...prev,
            pageIndex: table.getState().pagination.pageIndex - 1,
          }))
        }
        disabled={!table.getCanPreviousPage()}
      >
        Previous
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="cursor-pointer"
        onClick={() =>
          setPagination((prev) => ({
            ...prev,
            pageIndex: table.getState().pagination.pageIndex + 1,
          }))
        }
        disabled={!table.getCanNextPage()}
      >
        Next
      </Button>
    </div>
  </div>
)}

        </div>
    );
}
