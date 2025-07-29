import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import type { NewClient } from "@/components/UClient";
import { getCasebyClient } from "@/service/case.service";
import { useToast } from "@/context/ToastContext";
import { useLoading } from "./LoadingContext";
import { useAuth } from "@/context/AuthContext";
import { Label } from "@radix-ui/react-label";
import { Controller, useForm } from "react-hook-form";
import { DateInput } from "./ui/date-input";
import { CaseFilterType, type FilterFormValues } from "./CaseDesAll";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "@/components/ui/tabs";
import { clientTransaction } from "@/service/client.service";
// import { useReactToPrint } from "react-to-print";
import type { payment } from "./ClientPortal";
import printJS from "print-js";
import { DataTable } from "./DataTable";
import { clientTransactioncolumns } from "@/lib/tables.data";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";

// Dummy types – replace with actual types
type CaseItem = {
  id: string;
  CaseNo: number;
  createdAt: string;
  totalAmount:string;
  status: string;
  createdBy: { firstName: string; lastName: string; email: string };
  vehicleDetail: {
    vehicleNo: string;
    fromRTO: string;
    toRTO: string;
    chassisNo: string;
    engineNo: string;
    rmaVehicleNo: string;
  };
  generalDetail: {
    firmName: string;
    incentiveAmount: string;
    appointmentDate: string;
    applicationNo: string;
    applicationDate: string;
  };
  assignedTo: {
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  payment : payment;
};


export default function ClientDetails() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const client: NewClient = state?.client;
  const toast = useToast();
  const [cases, setCases] = useState<CaseItem[]>([]);
  const { setLoading } = useLoading();
  const [isDisabled, setisDisabled] = useState(true);
  const [filteredCases, setFilteredCases] = useState<any>();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  // const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  // const handleLogout = () => {
  //   logout();
  // };

    const { handleSubmit, setValue, control,watch } = useForm<FilterFormValues>({
      defaultValues: {
    filterType: "applicationDate",
    fromDate: "",
    toDate: "",
  },
    });

     useEffect(() => {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  

  const defaultFrom = `${yyyy}-${mm}-01`;
  const defaultTo = `${yyyy}-${mm}-${dd}`;

  setValue("fromDate", defaultFrom);
  setValue("toDate", defaultTo);
}, [setValue]);

const selectedFilterType = watch("filterType")

  useEffect(() => {
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");

        const defaultFrom = `${yyyy}-${mm}-01`;
        const defaultTo = `${yyyy}-${mm}-${dd}`;

        setValue("fromDate", defaultFrom);
        setValue("toDate", defaultTo);


        if (!defaultFrom || !defaultTo) return;

        setLoading(true);
        clientTransaction(defaultFrom, defaultTo, client.users[0]?.id).then((response) => {
            setFilteredCases(response?.data || []);
            setLoading(false);

            if (response?.data?.transactions?.length > 0) {
                setisDisabled(true);
            } else {
                setisDisabled(false);
            }
        }).
            catch((err: any) => {
                if(err?.status == 401 || err?.response?.status == 401)
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
                //   console.error("Error fetching filtered cases:", err);
                toast.showToast("Error", err?.message, "error");
            }).finally(() => {
                setLoading(false);
            })

    },
        [setValue]);

const applyFilter = async (data: FilterFormValues) => {
  const { fromDate, toDate, filterType } = data;

  if (!fromDate || !toDate) return;

  setLoading(true);
  try {
    const response = await getCasebyClient(client.users[0]?.id,filterType, fromDate, toDate);
    if (!response?.data || response.data.length === 0) {
      toast.showToast("Information", "No cases Available", "info");
    }
    setCases(response?.data || []);
  } catch (err: any) {
    if(err?.status == 401 || err?.response?.status == 401)
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
    toast.showToast("Error", err?.message || "Failed to apply filter", "error");
  } finally {
    setLoading(false);
  }
};

const applyFilter2 = async (data: FilterFormValues) => {
  const { fromDate, toDate } = data;
  
          if (!fromDate || !toDate) return;
  
          setLoading(true);
          try {
              const response = await clientTransaction(fromDate, toDate,client.users[0]?.id);
              setFilteredCases(response?.data || []);
              setisDisabled(response?.data?.transactions?.length > 0);
          } catch (err:any) {
              if(err?.status == 401 || err?.response?.status == 401)
          {
            toast.showToast('Error', 'Session Expired', 'error');
            logout();
          }
              //   console.error("Error fetching filtered cases:", err);
              toast.showToast("Error", "Failed to apply filter", "error");
          } finally {
              setLoading(false);
          }
};

const filterType = watch("filterType");

  useEffect(() => {
            const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");

        const defaultFrom = `${yyyy}-${mm}-01`;
        const defaultTo = `${yyyy}-${mm}-${dd}`;

        setValue("fromDate", defaultFrom);
        setValue("toDate", defaultTo);


        if (!defaultFrom || !defaultTo) return;
    if (!client.users[0]?.id) {
      toast.showToast('Error:', 'No Valid Id Provided', 'error');
      return;
    }
    setLoading(true);
    getCasebyClient(client.users[0]?.id,filterType,defaultFrom, defaultTo)
      .then((res) => setCases(res?.data?.cases || []))
      .catch((err) => {
        if(err?.status == 401 || err?.response?.status == 401)
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
        toast.showToast('Warning:', err?.message || 'No Cases assigned Yet', 'warning');
      })
      .finally(() => setLoading(false));
  }, [client?.id]);


  const toggleCard = (idx: number) => {
    setExpandedIndex((prev) => (prev === idx ? null : idx));
  };

const handlePrint = () => {
  printJS({
    printable: 'printable-content',
    type: 'html',
    targetStyles: ['*'], // apply all styles
  });
};
  
  
      const PrintField = ({ label, value }: { label: string; value?: string | number | boolean }) => {
        const isBoolean = typeof value === 'boolean' || value === 'Yes' || value === 'No';
        const isYes = value === true || value === 'Yes';
        
        return (
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="font-medium text-gray-700 min-w-[140px]">{label}</span>
            <span className={`font-semibold text-right flex-1 ${
              isBoolean 
                ? isYes 
                  ? 'text-green-600 bg-green-50 px-2 py-1 rounded' 
                  : 'text-red-600 bg-red-50 px-2 py-1 rounded'
                : 'text-gray-900'
            }`}>
              {value || "-"}
            </span>
          </div>
        );
      };

  
      const Section = ({
        title,
        children,
        className = "",
      }: {
        title: string;
        children: React.ReactNode;
        className?: string;
      }) => (
        <div className={`mb-8 ${className}`}>
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-t-lg shadow-sm">
            <h3 className="text-lg font-bold">{title}</h3>
          </div>
          <div className="bg-white border border-gray-200 rounded-b-lg shadow-sm p-6">
            <div className="space-y-1">
              {children}
            </div>
          </div>
        </div>
      );

      const PrintableCaseDetails = ({
          firstName,
          lastName,
          email,
          phoneNo,
          creditLimit,
          transactions = [],
      }: any) => {
          return (
            <div id="printable-content" className="p-8 text-sm leading-relaxed bg-gray-50 min-h-screen print-content">
              {/* Letterhead */}
              <div className="bg-white rounded-lg shadow-lg p-8 mb-8 border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src="/Group.svg"
                      alt="Letterhead"
                      className="h-16 w-auto pr-5"
                    />
                    <div>
                      <h1 className="text-xl font-bold text-gray-800">Client Details Report</h1>
                      <p className="text-gray-600 text-sm">Generated on {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                      <p className="text-sm font-medium">Client ID</p>
                      <p className="text-xl font-bold">#{firstName?.slice(0, 3).toUpperCase()}{lastName?.slice(0, 3).toUpperCase()}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Information */}
              <Section title="Client Information">
                <PrintField label="First Name" value={firstName} />
                <PrintField label="Last Name" value={lastName} />
                <PrintField label="Email" value={email} />
                <PrintField label="Phone No." value={phoneNo} />
                <PrintField label="Credit Limit" value={creditLimit ? `₹${creditLimit}` : "Not Set"} />
              </Section>

              {/* Transaction History */}
              {transactions.length > 0 && (
                <Section title="Transaction History">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-xs">
                      <thead className="bg-gray-100 text-gray-800 uppercase tracking-wide">
                        <tr>
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Date</th>
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Remarks</th>
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Mode</th>
                          <th className="border border-gray-300 px-4 py-2 text-left font-semibold">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((txn: any, index: number) => (
                          <tr key={index} className="even:bg-gray-50 odd:bg-white">
                            <td className="border border-gray-300 px-4 py-2">
                              {new Date(txn.paymentDate).toLocaleDateString()}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 capitalize">{txn.remark}</td>
                            <td className="border border-gray-300 px-4 py-2">{txn.mode}</td>
                            <td className="border border-gray-300 px-4 py-2 font-semibold">₹{txn.Amount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Section>
              )}

              {/* Summary Section */}
              <div className="bg-white rounded-lg shadow-lg p-6 mt-8 border border-gray-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
                  Transaction Summary
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="font-medium text-blue-800">Total Transactions</p>
                    <p className="text-blue-600 font-semibold">{transactions.length}</p>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <p className="font-medium text-green-800">Total Amount</p>
                    <p className="text-green-600 font-semibold">
                      ₹{transactions.reduce((sum: number, txn: any) => sum + (parseFloat(txn.Amount) || 0), 0).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="font-medium text-purple-800">Credit Limit</p>
                    <p className="text-purple-600 font-semibold">{creditLimit ? `₹${creditLimit}` : 'Not Set'}</p>
                  </div>
                </div>
              </div>
            </div>
          );
      };

    const [showModal, setShowModal] = useState(false);
    const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);


return (
  <SidebarProvider>
    <AppSidebar />
    <SidebarTrigger />
    <div className="flex flex-col w-full bg-white lg:pr-6 px-2 lg:py-20 h-full min-h-[100vh] print:hidden">
      <div className="flex justify-end mb-4">
        <Button
          style={{ cursor: "pointer" }}
          variant="default"
          className="sticky cursor-pointer z-50 mr-5 px-4 py-2 rounded bg-primary text-white hover:bg-primary/90 transition"
          onClick={() => navigate(-1)}
        >
          ← Back
        </Button>
      </div>

      {/* Client Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex gap-4 flex-1 md:items-center">
            <div className="h-16 w-24 md:h-24 md:w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 md:text-4xl text-2xl font-bold">
              {client?.firstName?.[0].toUpperCase() ?? ""}
              {client?.lastName?.[0].toUpperCase() ?? ""}
            </div>
            <div className="space-y-1">
              <p>
                <strong>Name:</strong> {client?.firstName} {client?.lastName}
              </p>
              <p>
                <strong>Email:</strong> {client?.email}
              </p>
              <p className="text-sm text-muted-foreground">
                {client.firmName} {client.address1}, {client.address2},{" "}
                {client.city} {client.state} {client.pincode}
              </p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabs Section */}
      <Tabs defaultValue="transaction" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="case">Case History</TabsTrigger>
          <TabsTrigger value="transaction">Transaction History</TabsTrigger>
        </TabsList>

        {/* Tab: Case History */}
        <TabsContent value="case">
          <form
            onSubmit={handleSubmit(applyFilter)}
            className="flex flex-wrap gap-4 items-end md:flex-nowrap mb-7"
          >
            {/* Filter Type */}
            <div className="flex flex-col space-y-1 min-w-[150px] flex-1">
              <Label className="text-sm font-medium">
                Filter Type<span className="text-red-500">*</span>
              </Label>
              <Controller
                control={control}
                name="filterType"
                render={({ field }) => (
                  <Select key={selectedFilterType} onValueChange={field.onChange} value={selectedFilterType}>
                    <SelectTrigger className="w-full md:w-[200px]">
                      <SelectValue placeholder="Select Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CaseFilterType).map(([key, value]) => (
                        <SelectItem key={key} value={value}>
                          {key.replace(/_/g, " ").toLowerCase().replace(/(^|\s)\S/g, (l) => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            {/* From Date */}
            <div className="flex flex-col space-y-1 min-w-[150px] flex-1">
              <Label htmlFor="fromDate" className="text-sm font-medium capitalize">
                From Date<span className="text-red-500">*</span>
              </Label>
              <Controller
                name="fromDate"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <DateInput
                    id="fromDate"
                    value={field.value}
                    onChange={(e: any) => field.onChange(e.target.value)}
                  />
                )}
              />
            </div>

            {/* To Date */}
            <div className="flex flex-col space-y-1 min-w-[150px] flex-1">
              <Label htmlFor="toDate" className="text-sm font-medium capitalize">
                To Date<span className="text-red-500">*</span>
              </Label>
              <Controller
                name="toDate"
                control={control}
                rules={{ required: true }}
                render={({ field }) => (
                  <DateInput
                    id="toDate"
                    value={field.value}
                    onChange={(e: any) => field.onChange(e.target.value)}
                  />
                )}
              />
            </div>

            <div className="w-full md:w-auto flex-1">
              <Button type="submit" className="mt-2 w-full md:w-auto" style={{ cursor: "pointer" }}>
                Filter
              </Button>
            </div>
          </form>

          {/* Transaction Case Cards */}
          {cases.length === 0 ? (
            <p className="text-muted-foreground text-center">No cases found for this client.</p>
          ) : (
            cases.map((caseData, idx) => {
              const isOpen = expandedIndex === idx;
              const {payment} = caseData;

              return (
                <Card key={caseData.id} className="border shadow-md mb-5">
                  <CardHeader
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleCard(idx)}
                  >
                    <div>
                      <h2 className="font-semibold text-lg">Case #{caseData?.CaseNo ?? ""}</h2>
                        {payment && payment.status ? (
                      payment.status.toLowerCase() === "failed" ? (
                        <p className="text-sm text-red-600 font-semibold flex items-center">
                          <span className="inline-block w-2 h-2 rounded-full bg-red-600 mr-2"></span>
                          {payment.status.toLocaleUpperCase()}
                        </p>
                      ) : payment.status.toLowerCase() === "success" ? (
                        <p className="text-sm text-green-600 font-semibold"> <span className="inline-block w-2 h-2 rounded-full bg-green-600 mr-2"></span>{payment.status.toUpperCase()}</p>
                      ) : (
                        <p className="text-sm text-blue-600 font-semibold">{payment.status.toUpperCase()}</p>
                      )
                    ) : (
                      <p className="text-sm text-blue-600 font-semibold">{caseData.status.toUpperCase()}</p>
                    )}
                    </div>
                    {isOpen ? <ChevronUp /> : <ChevronDown />}
                  </CardHeader>

                  {isOpen && (
                    <CardContent className="space-y-4 text-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <RenderField
                          label="Vehicle No"
                          value={caseData.vehicleDetail?.vehicleNo ?? "N/A"}
                        />
                        <RenderField
                          label="Created On"
                          value={new Date(caseData.createdAt).toLocaleDateString()}
                        />
                        <RenderField
                          label="Total Amount"
                          value={`₹${(+caseData.totalAmount).toFixed(2)}/-`}
                        />
                        <RenderField label="Status" value={caseData.status} />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          onClick={() =>
                            navigate(`/superadmin/cases/${caseData.CaseNo}`, {
                              state: { id: caseData.id },
                            })
                          }
                          variant="outline"
                          size="sm"
                          style={{ cursor: "pointer" }}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </TabsContent>

        {/* Tab: Transaction History */}
        <TabsContent value="transaction">
          {/* Filter Form */}
                              <Button type="button" disabled={!isDisabled} style={{ cursor: isDisabled ? "pointer" : "not-allowed" }} onClick={handlePrint} className="w-fit bg-primary text-white mb-5">
                        🖨️ Print PDF
                    </Button>
                    <form
                        onSubmit={handleSubmit(applyFilter2)}
                        className="flex flex-wrap gap-4 items-end md:flex-nowrap"
                    >
                        {/* From Date */}
                        <div className="flex flex-col space-y-1 flex-1 min-w-[140px]">
                            <Label htmlFor="fromDate" className="text-sm font-medium capitalize">
                                From Date<span className="text-red-500">*</span>
                            </Label>
                            <Controller
                                name="fromDate"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <DateInput
                                        id="fromDate"
                                        value={field.value}
                                        onChange={(e: any) => field.onChange(e.target.value)}
                                    />
                                )}
                            />
                        </div>

                        {/* To Date */}
                        <div className="flex flex-col space-y-1 flex-1 min-w-[140px]">
                            <Label htmlFor="toDate" className="text-sm font-medium capitalize">
                                To Date<span className="text-red-500">*</span>
                            </Label>
                            <Controller
                                name="toDate"
                                control={control}
                                rules={{ required: true }}
                                render={({ field }) => (
                                    <DateInput
                                        id="toDate"
                                        value={field.value}
                                        onChange={(e: any) => field.onChange(e.target.value)}
                                    />
                                )}
                            />
                        </div>

                        <Button type="submit" style={{ cursor: "pointer" }} className="mt-2 w-full md:w-auto">
                            Filter
                        </Button>
                    </form>
                    <DataTable
                                            data={filteredCases?.transactions ?? []}
                                            columns={[...clientTransactioncolumns,
                                            {
                                                header: "Actions",
                                                id: "actions",
                                                cell: ({ row }) => (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        className="cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedTransaction(row.original); // Set modal data
                                                            setShowModal(true); // Open modal
                                                        }}
                                                    >
                                                        View Details
                                                    </Button>
                                                ),
                                            }
                    
                    
                                            ]
                                            }
                                        />
                                                        {showModal && selectedTransaction && (
                    <Dialog open={showModal} onOpenChange={setShowModal}>
                        <DialogContent >
                            <DialogHeader>
                                <DialogTitle>Transaction Details</DialogTitle>
                                <DialogDescription>
                                    Below are the linked case details for this transaction.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="mt-4 space-y-2">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Case No</TableHead>
                                            <TableHead>Vehicle No</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {selectedTransaction.cases?.map((c: any) => (
                                            <TableRow key={c.id}>
                                                <TableCell>{c.caseNo}</TableCell>
                                                <TableCell>{c.vehicleNo}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
        </TabsContent>
      </Tabs>
    </div>


                    <div className="print:block hidden text-sm leading-relaxed">
                    <PrintableCaseDetails
                        firstName={filteredCases?.clientDetails?.firstName}
                        lastName={filteredCases?.clientDetails?.lastName}
                        email={filteredCases?.clientDetails?.email}
                        phoneNo={filteredCases?.clientDetails?.phoneNo}
                        creditLimit={filteredCases?.clientDetails?.client?.creditLimit}
                        transactions={filteredCases?.transactions || []}
                    />
                </div>
  </SidebarProvider>
);
}

// Reusable field renderer
function RenderField({ label, value }: { label: string; value?: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium">{value || "—"}</p>
    </div>
  );
}
