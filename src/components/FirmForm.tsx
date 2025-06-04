import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Switch } from "@/components/ui/switch";
import { createFirm, toggleFirm, getFirm } from "@/service/firm.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useLoading } from "./LoadingContext";
import { Label } from "@radix-ui/react-label";
// import { Toaster } from "@/components/ui/sonner";

export interface Firm {
  name: string;
  id: string;
  isActive?: boolean;
}

export default function AdminFirmForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Firm>({ defaultValues: {} as Firm });

  const [firms, setfirms] = useState<Firm[]>([]);
const {setLoading} = useLoading();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);

  useEffect(() => {
    setLoading(true);
    getFirm()
      .then((resp) => {
        setfirms(resp?.data);
      })
      .catch((err: any) => {
        console.error("Error fetching firms:", err);
      })
      .finally(() => setLoading(false));
  }, [refreshFlag]);

  const onSubmit: SubmitHandler<Firm> = async (data: Firm) => {
    setLoading(true);
    try {
      const newFirm = await createFirm(data);
      setfirms([...firms, newFirm]);
      setDialogOpen(false);
      setRefreshFlag((prev) => !prev); // Trigger a refresh
      reset(); // Reset the form after successful submission
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (Firm: string) => {
    setLoading(true);
    try {
      console.log("Toggling Firm:", Firm);
      await toggleFirm(Firm);
      console.log("Firm toggled successfully");
    } catch (err: any) {
      console.error(err);
    } finally {
      setRefreshFlag((prev) => !prev); // Trigger a refresh
      setLoading(false);
    }
  };
    const handleDiagClick = () => {
    setDialogOpen(false);
    reset(); // Reset the form when dialog is closed
  }

  const [currentPage, setCurrentPage] = useState(1);
  const [items, setItemsper] = useState("10"); // Default to 10 entries
  const items_per_page = parseInt(items, 10);

  const isEntryLimitValid = items_per_page >= 1 && items_per_page <= 20;
  const ITEMS_PER_PAGE = items_per_page;
  const totalPages = isEntryLimitValid
    ? Math.ceil(firms.length / ITEMS_PER_PAGE)
    : 1;

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedFirms = isEntryLimitValid
    ? firms.slice(startIdx, startIdx + ITEMS_PER_PAGE)
    : [];

  useEffect(() => {
    setCurrentPage(1); // Reset to first page when limit changes
  }, [items_per_page]);

  const handlePrev = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNext = () =>
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  return (
    <div>
      <Button onClick={() => setDialogOpen(true)} className="mb-4">
        Add Firm
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Firm</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
            {["name"].map((field) => (
              <div key={field}>
                <Input
                  {...register(field as keyof Firm, { required: true })}
                  placeholder={field[0].toUpperCase() + field.slice(1)}
                />
                {errors[field as keyof Firm] && (
                  <p className="text-red-600 text-sm">{field} is required</p>
                )}
              </div>
            ))}

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleDiagClick}
              >
                Cancel
              </Button>
              <Button type="submit">
               Create
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
             <TableHead>Active</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedFirms.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-4">
                No Firm found.
              </TableCell>
            </TableRow>
          ) : (
            paginatedFirms.map((Firm,idx) => (
                <TableRow
                key={Firm.id}
                className={
                  (idx % 2 === 1 ? "bg-gray-200 dark:bg-gray-900 " : "") +
                  "rounded-xl overflow-hidden"
                }
                style={{
                  borderRadius: "0.75rem",
                  overflow: "hidden",
                }}
                >
                <TableCell className="first:rounded-l-xl last:rounded-l-xl">
                  {Firm.name}
                </TableCell>
                <TableCell>
                  <Switch
                  checked={!!Firm.isActive}
                  onCheckedChange={() => handleToggle(Firm?.id ?? "")}
                  />
                </TableCell>
                </TableRow>
            ))
          )}
        </TableBody>
      </Table>
<div className="flex items-center justify-end mb-4">
            <Label htmlFor="entryLimit" className="mr-2 font-medium">
              No of entries:
            </Label>
            <Input
              id="entryLimit"
              type="number"
              min="1"
              max="20"
              value={items_per_page === 0 ? "" : items_per_page}
              onChange={(e) => {
                const val = e.target.value;
                setItemsper(val === "" ? "" : val);
              }}
              className="border rounded px-3 py-1 w-20 text-sm"
            />
          </div>
          {items !== "" && !isEntryLimitValid && (
            <div className="text-red-500 text-right text-xs mb-2">
              Please enter a value between 1 and 20.
            </div>
          )}
      <Pagination className="mt-4">
        <PaginationContent>
          <PaginationItem>
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentPage === 1}
              className="disabled:opacity-50"
            >
              <PaginationPrevious />
            </button>
          </PaginationItem>
          <PaginationItem className="px-4 text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </PaginationItem>
          <PaginationItem>
            <button
              type="button"
              onClick={handleNext}
              disabled={currentPage === totalPages}
              className="disabled:opacity-50"
            >
              <PaginationNext />
            </button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
