import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { useLoading } from "./LoadingContext";
import { makePayment } from "@/service/client.service";
import { uploadFileToServer } from "@/service/branch.service";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";

const paymentOptions = [
  { label: "Cash", value: "CASH" },
  { label: "UPI", value: "UPI" },
  { label: "Credit", value: "CREDIT" },
];

type FormData = {
  paymentMethod: string;
  paymentProofUrl?: string;
};

const Payment = () => {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const caseIds: string[] = location.state?.paidCaseIds || [];
  const amounts: number[] = location.state?.totalPayable || [];
  const caseNos: string[] = location.state?.caseNos || [];

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isSubmitting },
  } = useForm<FormData>({
    defaultValues: {
      paymentMethod: "CASH",
    },
  });

  const paymentMethod = watch("paymentMethod");
  const [viewImageOpen, setViewImageOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null);
  const [totalAmount, setTotalAmount] = useState(0);
  const { setLoading } = useLoading();
  const navigate = useNavigate();

  useEffect(() => {
    if (amounts && amounts.length > 0) {
      const sum = amounts.reduce((acc, amt) => acc + amt, 0);
      setTotalAmount(sum);
    }
  }, [amounts]);

  const onFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];

    // Validate file type and size
    if (!file.type.startsWith("image/")) {
      toast.showToast("Invalid file", "Only image files are allowed.", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.showToast("File too large", "Maximum file size is 10MB.", "error");
      return;
    }

    setUploading(true);
    try {
      const response = await uploadFileToServer(file);
      const url = response?.data?.url;
      if (url) {
        setUploadedFileUrl(url);
        setValue("paymentProofUrl", url);
        toast.showToast("Upload successful", "Payment proof uploaded.", "success");
      } else {
        throw new Error("Upload failed");
      }
    } catch (error: any) {
      toast.showToast("Upload failed", error.message || "File upload failed.", "error");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);

    const payload: any = {
      caseAssignmentIds: caseIds,
      amount: Number(totalAmount.toFixed(2)),
      mode: data.paymentMethod,
    };



    if (data.paymentMethod !== "CREDIT") {
      payload.paymentProofUrl = uploadedFileUrl || "";
    }

    makePayment(payload)
      .then(() => {
        toast.showToast("Payment successful", "Your payment has been processed.", "success");
      })
      .catch((error: any) => {
        toast.showToast("Payment failed", error.message || "Something went wrong", "error");
      })
      .finally(() => {
        navigate(-1);
        setLoading(false);
      });
  };

  const handleLogout = () => logout();

  const makeUpiPayment = () => {
    const url = `upi://pay?pa=nirmalshah20519@okhdfcbank&pn=Deepak%20Khatri&am=${totalAmount}&tn=CASE_FEE`
    window.location.href = url;
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <div className="flex flex-col w-full bg-white pr-6 lg:py-20 h-full min-h-[100vh]">
        <div className="flex justify-end mb-4">
          <Button
            variant="destructive"
            className="cursor-pointer hover:bg-red-800"
            onClick={() => setOpen(true)}
          >
            Logout
          </Button>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Confirm Logout</DialogTitle>
                <DialogDescription>
                  Are you sure you want to logout?
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-2">
                <Button variant="outline" style={{ cursor: "pointer" }} onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" style={{ cursor: "pointer" }} onClick={handleLogout}>
                  Logout
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col w-full h-full min-h-screen overflow-y-auto space-y-8 px-4 py-6 bg-gray-50 rounded-md shadow-sm"
        >
          <h2 className="text-2xl font-semibold mb-6 text-gray-900">
            Payment Summary
          </h2>

          <div className="overflow-x-auto rounded-md border border-gray-300 bg-white shadow-sm">
            <Table className="min-w-full">
              <TableHeader className="bg-gray-100">
                <TableRow>
                  <TableHead className="text-gray-700 font-medium">Case No</TableHead>
                  <TableHead className="text-gray-700 font-medium">Total Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {caseIds.map((id, idx) => (
                  <TableRow key={id}>
                    <TableCell className="font-semibold text-gray-800">{caseNos[idx] ?? "—"}</TableCell>
                    <TableCell className="text-gray-700">₹{amounts[idx].toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-end mt-4 mb-2">
            <span className="text-lg font-semibold text-gray-900">
              Total Amount Payable: ₹{totalAmount.toFixed(2)}
            </span>
          </div>

          <div className="space-y-3">
            <Label className="font-semibold text-gray-800 text-lg">
              Choose Payment Method
            </Label>
            <Controller
              name="paymentMethod"
              control={control}
              render={({ field }) => (
                <RadioGroup
                  value={field.value}
                  onValueChange={field.onChange}
                  className="flex space-x-6"
                >
                  {paymentOptions.map(({ value, label }) => (
                    <div key={value} className="flex items-center space-x-2">
                      <RadioGroupItem value={value} id={value} />
                      <Label htmlFor={value} className="cursor-pointer text-base">
                        {label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
          </div>

          {
            paymentMethod === "UPI" &&
            <Button
              onClick={() => makeUpiPayment()}
              className=" cursor-pointer w-fit"
            >
              Pay With UPI
            </Button>
          }

          {(paymentMethod === "CASH" || paymentMethod === "UPI") && (
            <div className="mt-2 space-y-3">
              <Label
                htmlFor="paymentProof"
                className="font-semibold text-gray-800 text-lg block"
              >
                Upload Payment Proof
              </Label>
              <Controller
                name="paymentProofUrl"
                control={control}
                render={() => (
                  <input
                    type="file"
                    id="paymentProof"
                    accept="image/*"
                    onChange={(e) => onFileChange(e.target.files)}
                    className="block w-full text-gray-700 border border-gray-300 rounded-md p-2 cursor-pointer"
                  />
                )}
              />
              {uploading && <p className="text-blue-600">Uploading image...</p>}
              {uploadedFileUrl && (
                <div className="flex items-center space-x-4">
                  <Button
                    style={{ cursor: "pointer" }}
                    type="button"
                    variant="secondary"
                    onClick={() => setViewImageOpen(true)}
                  >
                    View Uploaded Image
                  </Button>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting} style={{ cursor: "pointer" }} variant="default" className="px-8">
              {isSubmitting ? "Processing..." : "Pay Now"}
            </Button>
          </div>
        </form>

        {/* Image Preview Dialog */}
        {uploadedFileUrl && (
          <Dialog open={viewImageOpen} onOpenChange={setViewImageOpen}>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Payment Proof Preview</DialogTitle>
                <DialogDescription>
                  Please confirm this is the correct image before submitting your payment.
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col items-center gap-4">
                <img
                  src={uploadedFileUrl}
                  alt="Uploaded Payment Proof"
                  className="rounded-md border max-h-96 object-contain"
                />
                <Button variant="outline" style={{ cursor: "pointer" }} onClick={() => setViewImageOpen(false)}>
                  Close Preview
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </SidebarProvider>
  );
};

export default Payment;
