import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Label } from "./ui/label";
import { Controller, useForm } from "react-hook-form";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useLoading } from "./LoadingContext";
import { useToast } from "@/context/ToastContext";
import { useEffect, useState } from "react";
import { billbyId, getBills, getUpi, makebillPayment } from "@/service/bills.service";
import { useAuth } from "@/context/AuthContext";
import { type Payment } from "@/lib/tables.data";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { uploadFileToServer } from "@/service/branch.service";
import { QRCodeSVG } from "qrcode.react";
// import { useState } from "react";

export interface Bill{
     billId: string,
     billMonth: string,
     billYear:string,
     billAmount:string,
     BillDate:string,
     Duedate:string,
}

const paymentOptions = [
  { label: "Cash", value: "CASH" },
  { label: "UPI", value: "UPI" },
];


const ClientBills = () => {
  const { handleSubmit, control, setValue, watch, formState: { isSubmitting } } = useForm<{
    filterType: string;
    paymentProofUrl: string;
    paymentMethod: string;
  }>({
    defaultValues: {
      filterType: "",
      paymentProofUrl: "",
      paymentMethod: "",
    },
  });

  const toast = useToast();
  const { user,logout } = useAuth();
  const [bills, setBills] = useState<Bill[]>();
  const [bdata,setBdata] = useState<Payment[]>([]);
  const [bill,setBill] = useState<any>(null);
    const [uploading, setUploading] = useState(false);
  const [uploadedFileUrl, setUploadedFileUrl] = useState(null);
  const [viewImageOpen, setViewImageOpen] = useState(false);
  const { setLoading } = useLoading();
    const paymentMethod = watch("paymentMethod");
    const [flag, setFlag] = useState(false);

  useEffect(() => {
    setLoading(true);
    getBills(user?.id)
      .then((resp) => {
        setBills(resp?.data ?? []);
        toast.showToast('Success','All Bills Fetched','success');
      })
      .catch((err: any) => {
        if(err?.status == '401' || err?.response?.status == '401')
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
        toast.showToast("Error", err?.message || "Fetching error", "error");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [flag]);

  const applyFilter = async (data: { filterType: string }) => {
  const { filterType } = data;

  if (!filterType) return;

  setLoading(true);
  try {
    const resp = await billbyId(filterType);
    const bill = resp?.data;
    setBill(bill);
    // console.log(bill);
    setBdata(bill?.payments || []);
      toast.showToast("Success", resp?.message, "success");
  } catch (err:any) {
    if(err?.status == '401' || err?.response?.status == '401')
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
    toast.showToast("Error", "Failed to apply filter", "error");
  } finally {
    setLoading(false);
  }
};

  const onFileChange = async (files:any) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      toast.showToast("Invalid file", "Only image files are allowed.", "error");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.showToast("File too large", "Max file size is 10MB.", "error");
      return;
    }
    setUploading(true);
    try {
      const response = await uploadFileToServer(file);
      const url = response?.data?.url;
      if (url) {
        setUploadedFileUrl(url);
        setValue("paymentProofUrl", url);
        toast.showToast("Upload successful", "Proof uploaded.", "success");
      }
    } catch (error:any) {
      if(error?.status == '401' || error?.response?.status == '401')
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
      toast.showToast("Upload failed", error.message || "File upload failed", "error");
    } finally {
      setUploading(false);
    }
  };
  const handlePayment = async () => {
    const totalAmount = bdata.reduce((acc: number, item: Payment) => acc + Number(item.amount), 0);
    if (!uploadedFileUrl) {
      toast.showToast("Missing Proof", "Please upload a payment proof image before proceeding.", "error");
      return;
    }
    setLoading(true);
    try {
      await makebillPayment({
        billId: watch("filterType") ?? "",
        amount: Number(totalAmount.toFixed(2)),
        mode: paymentMethod,
        paymentProofUrl: uploadedFileUrl,
      });
      toast.showToast("Payment successful", "Your payment has been processed.", "success");
    } catch (error:any) {
      if(error?.status == '401' || error?.response?.status == '401')
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
      toast.showToast("Payment failed", error.message || "Something went wrong", "error");
    } finally {
      setFlag(f =>!f);
      setBdata([]);
      setBill(null);
      setLoading(false);
    }
  };

    const [upiPerson,setUpiPerson] = useState("");
  
      useEffect(()=>{
  
        setLoading(true);
        getUpi().then((resp)=>{
          setUpiPerson(resp?.data?.upi);
        }).catch((err:any)=>{
                    if(err?.status == '401' || err?.response?.status == '401')
          {
            toast.showToast('Error', 'Session Expired', 'error');
            logout();
          }
            toast.showToast('Error',err?.message || 'Error fetching UPI Id','error')
          }).finally(()=>{
            setLoading(false);
          })
  
      },[]);

  const canPay = watch('paymentProofUrl').length>0 && watch('paymentMethod').length>0
    const upiUrl = `upi://pay?pa=${upiPerson}&pn=Vahaan%20Record&am=${bill?.totalAmount}&tn=CASE_FEE`;

//this part yet to figure out
// 


  return (
  <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <div className="flex flex-col w-full bg-white lg:pr-6 px-2 lg:py-20 h-full min-h-[100vh]">
        <form
          onSubmit={handleSubmit(applyFilter)}
          className="flex flex-wrap gap-4 items-end md:flex-nowrap p-4"
        >
          <div className="flex flex-col space-y-1 min-w-[200px] flex-1">
            <Label className="text-sm font-medium">
              Select Bill<span className="text-red-500">*</span>
            </Label>
            <Controller
              name="filterType"
              control={control}
              rules={{ required: true }}
              render={({ field, fieldState }) => (
                <>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Bill" />
                    </SelectTrigger>
                    <SelectContent>
                      {bills?.map((bill:any) => (
                        <SelectItem key={bill.billId} value={bill.billId}>
                          {bill.billMonth}-{bill.billYear}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {fieldState.error && (
                    <span className="text-xs text-red-500">
                      {fieldState.error.message || "This field is required"}
                    </span>
                  )}
                </>
              )}
            />
          </div>

          <div className="w-full md:w-auto">
            <Button type="submit" className="mt-2 w-full md:w-auto cursor-pointer">
              Search Bill
            </Button>
          </div>
        </form>

        {bdata.length > 0 && (
          <div className="p-4 space-y-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Case Date</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bdata.map((item, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{new Date(item.paymentDate).toLocaleString()}</TableCell>
                    <TableCell>₹{item.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="font-semibold text-right text-lg text-gray-800">
              Total Amount: ₹{bdata.reduce((acc, item) => acc + Number(item.amount), 0).toFixed(2)}
            </div>


{bill && bill?.status === "success" && <p className=" text-green-500 font-semibold">Payment already done and verified</p>}
{bill && bill?.status === "paid" && <p className=" text-yellow-500 font-semibold">Payment under verification</p>}
{bill && bill?.status === "failed" && <p className=" text-red-500 font-semibold">Your last payment has failed. You can try again</p>}
      
{bill && (bill?.status === "failed" || bill?.status === "generated") && 

(<>
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
                        <Label htmlFor={value}>{label}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              />

              
{paymentMethod === "UPI" && (
  <div className="flex flex-col items-start gap-4">
    {/* <Button
      onClick={() => makeUpiPayment()}
      className="cursor-pointer w-fit"
    >
      Pay With UPI
    </Button> */}

    <div className="flex flex-col justify-center items-center w-full">
      <p className="text-gray-700 font-medium mb-2 text-center">Scan this QR code:</p>
      <div className="flex justify-center items-center w-full">
      <QRCodeSVG value={upiUrl} size={180} />
      </div>
    </div>
  </div>
)}

            </div>
            <div className="space-y-3">
              {watch('paymentMethod').length>0 && <><Label className="font-semibold text-gray-800 text-lg block">
                Upload Payment Proof
              </Label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => onFileChange(e.target.files)}
                className="block w-full text-gray-700 border border-gray-300 rounded-md p-2 cursor-pointer"
              /></>}
                {uploading && (
                <div className="flex items-center space-x-2">
                  <span className="loader mr-2" />
                  <span className="text-blue-600">Uploading image...</span>
                </div>
                )}
                {uploadedFileUrl && (
                <div className="flex items-center space-x-4">
                  <Button
                  type="button"
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => setViewImageOpen(true)}
                  >
                  View Uploaded Image
                  </Button>
                </div>
                )}
            </div>

            <div className="flex justify-end">
              <Button
                type="button"
                disabled={isSubmitting || !canPay}
                onClick={handlePayment}
                className="px-8 cursor-pointer"
              >
                {isSubmitting ? "Processing..." : "Pay Now"}
              </Button>
            </div>
            </>
            )}
          </div>
        )}
      </div>
<Dialog open={viewImageOpen} onOpenChange={setViewImageOpen}>
  <DialogContent className="max-w-md sm:max-w-lg">
    <DialogHeader>
      <DialogTitle>Uploaded Payment Proof</DialogTitle>
      <DialogDescription>
        Below is the proof of payment you uploaded.
      </DialogDescription>
    </DialogHeader>
    {uploadedFileUrl && (
      <img
        src={uploadedFileUrl}
        alt="Payment Proof"
        className="rounded-md w-full h-auto border border-gray-200"
      />
    )}
  </DialogContent>
</Dialog>

    </SidebarProvider>
  );
};

export default ClientBills;