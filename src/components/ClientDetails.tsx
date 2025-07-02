import { useEffect, useRef, useState } from "react";
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
import { useReactToPrint } from "react-to-print";

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
                if(err?.status == '401' || err?.response?.status == '401')
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
    if(err?.status == '401' || err?.response?.status == '401')
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
              if(err?.status == '401' || err?.response?.status == '401')
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
        if(err?.status == '401' || err?.response?.status == '401')
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

      const contentRef = useRef<HTMLDivElement>(null);
      const reactToPrintFn = useReactToPrint({ contentRef });
  
  
      const PrintField = ({ label, value }: { label: string; value?: string | number | boolean }) => (
          <div className="mb-2">
              <span className="font-semibold">{label}:</span> {value || "-"}
          </div>
      );

          const Section2 = ({
        title,
        children,
        className = "",
    }: {
        title: string;
        children: React.ReactNode;
        className?: string;
    }) => (
        <div className={`mb-6 ${className}`}>
            <h2 className="text-lg font-bold mb-2 border-b pb-1">{title}</h2>
            <div className="grid grid-cols-2 gap-4">{children}</div>
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
              <div id="printable-content" className="p-12 text-sm leading-relaxed">
                  {/* Letterhead */}
                  <div className="mb-6 border-b pb-4">
                      <img src="/Group.svg" alt="Letterhead" className="mb-5 max-h-24" />
                      <p className="text-gray-600"></p>
                  </div>
  
                  {/* Client Info Section */}
                  <Section2 title="Client Details">
                      <PrintField label="First Name" value={firstName} />
                      <PrintField label="Last Name" value={lastName} />
                      <PrintField label="Email" value={email} />
                      <PrintField label="Phone No." value={phoneNo} />
                      <PrintField label="Credit Limit" value={creditLimit} />
                  </Section2>
  
                  {/* Transaction Table */}
                  {transactions.length > 0 && (
                      <div className="mt-8">
                          <h2 className="text-lg font-semibold mb-2">Transaction History</h2>
                          <table className="w-full text-left border border-collapse border-gray-300 text-xs">
                              <thead className="bg-gray-100">
                                  <tr>
                                      <th className="border px-3 py-2">Date</th>
                                      <th className="border px-3 py-2">Remarks</th>
                                      <th className="border px-3 py-2">Mode</th>
                                      <th className="border px-3 py-2">Amount</th>
                                  </tr>
                              </thead>
                              <tbody>
                                  {transactions.map((txn: any) => (
                                      <tr >
                                          <td className="border px-3 py-2">
                                              {new Date(txn.paymentDate).toLocaleDateString()}
                                          </td>
                                          <td className="border px-3 py-2 capitalize">{txn.remark}</td>
                                          <td className="border px-3 py-2">{txn.mode}</td>
                                          <td className="border px-3 py-2">₹{txn.Amount}</td>
                                      </tr>
                                  ))}
                              </tbody>
                          </table>
                      </div>
                  )}
              </div>
          );
      };

return (
  <SidebarProvider>
    <AppSidebar />
    <SidebarTrigger />
    <div className="flex flex-col w-full bg-white pr-6 lg:py-20 h-full min-h-[100vh] lg:ms-0 ms-2">
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

              return (
                <Card key={caseData.id} className="border shadow-md mb-5">
                  <CardHeader
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => toggleCard(idx)}
                  >
                    <div>
                      <h2 className="font-semibold text-lg">Case #{caseData?.CaseNo ?? ""}</h2>
                      <p className="text-sm text-muted-foreground">{caseData?.status ?? ""}</p>
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
                              <Button type="button" disabled={!isDisabled} style={{ cursor: isDisabled ? "pointer" : "not-allowed" }} onClick={reactToPrintFn} className="w-fit bg-primary text-white mb-5">
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
        </TabsContent>
      </Tabs>
    </div>


                    <div ref={contentRef} className="print:block hidden text-sm leading-relaxed">
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
