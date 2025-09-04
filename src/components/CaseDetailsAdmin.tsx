// Updated CaseDetailsAdmin.tsx
// Removed edit mode logic and renderField. Only viewing is supported now. Added Edit and Back buttons.

import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getCaseID } from "@/service/case.service";
import { useReactToPrint } from "react-to-print";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLoading } from "./LoadingContext";
import { useToast } from "@/context/ToastContext";
import { useAuth } from "@/context/AuthContext";

import type { FinalDetails } from "./CaseForm";
import { getActiveFirm } from "@/service/firm.service";
import type { Firm } from "./FirmForm";

export default function CaseDetailsAdmin() {
  const { setLoading } = useLoading();
  const toast = useToast();
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [firms, setfirms] = useState<Firm[]>([]);
  const caseId = location.state?.id;
  const [caseData, setCaseData] = useState<FinalDetails>();

  useEffect(() => {
    setLoading(true);

    getActiveFirm()
      .then((resp) => {
        setfirms(resp?.data);
      })
      .catch((err: any) => {
        if (err?.status == 401 || err?.response?.status == 401) {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
        else {
          toast.showToast('Error:', err?.message || 'Error during fetch of Firms', 'error');
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const getBoolStatus = (val?: boolean) => (val ? "Yes" : "No");

  const getFirmNameById = (id: string | undefined) => {
    if (!id) return "—";
    const firm = firms.find(f => f.id === id);
    return firm ? firm.name : id;
  };
  const Section2 = ({
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

  const formatDate = (dateStr: string | undefined): string | undefined =>
    dateStr?.split("T")[0] ?? undefined;

  //  const getFormattedCaseData = (caseData: FinalDetails): FinalDetails => ({
  //     ...caseData,
  //     generalDetail:{
  //       ...caseData.generalDetail,
  //       appointmentDate:formatDate(caseData.generalDetail.appointmentDate)??""
  //     },
  //     expireDetail: {
  //       ...caseData.expireDetail,
  //       insuranceExpiry: formatDate(caseData.expireDetail.insuranceExpiry) ?? "",
  //       pucExpiry: formatDate(caseData.expireDetail.pucExpiry) ?? "",
  //       fitnessExpiry: formatDate(caseData.expireDetail.fitnessExpiry) ?? "",
  //       taxExpiry: formatDate(caseData.expireDetail.taxExpiry) ?? "",
  //       permitExpiry: formatDate(caseData.expireDetail.permitExpiry) ?? "",
  //     }
  //   });
  const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const PrintableCaseDetails = ({
    caseNo,
    generalDetail,
    vehicleDetail,
    expireDetail,
    transactionDetail,
    ownerDetails,
    expenseDetail,
    referenceDetail,
  }: any) => {
    const formatDate = (date?: string) => (date ? new Date(date).toLocaleDateString() : "-");
    const getBool = (val?: boolean) => (val ? "Yes" : "No");

    return (
      <div
        id="printable-content"
        className="p-8 text-sm leading-relaxed bg-gray-50 print-content"
      >
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
                <h1 className="text-xl font-bold text-gray-800">Case Details Report</h1>
                <p className="text-gray-600 text-sm">Generated on {new Date().toLocaleDateString()}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-blue-600 text-white px-4 py-2 rounded-lg">
                <p className="text-sm font-medium">Case No</p>
                <p className="text-xl font-bold">#{caseNo}</p>
              </div>
            </div>
          </div>
        </div>
        {/* <p>{{name}}</p> */}

        <Section2 title="General Details" className="pt-8">
          <PrintField label="Firm Name" value={generalDetail?.firmName} />
          <PrintField label="Appointment Date" value={formatDate(generalDetail?.appointmentDate)} />
          <PrintField label="Application No." value={generalDetail?.applicationNo} />
          <PrintField label="Incentive Amount" value={generalDetail?.incentiveAmount} />
        </Section2>

        <Section2 title="Vehicle Details" className="pt-8">
          <PrintField label="Vehicle No" value={vehicleDetail?.vehicleNo} />
          <PrintField label="From RTO" value={vehicleDetail?.fromRTO} />
          <PrintField label="To RTO" value={vehicleDetail?.toRTO} />
          <PrintField label="Chassis No" value={vehicleDetail?.chassisNo} />
          <PrintField label="Engine No" value={vehicleDetail?.engineNo} />
          <PrintField label="RMA Vehicle No" value={vehicleDetail?.rmaVehicleNo} />
        </Section2>

        <Section2 title="Expire Details" className="pt-8 break-before-page">
          <PrintField label="Insurance Expiry" value={formatDate(expireDetail?.insuranceExpiry)} />
          <PrintField label="PUC Expiry" value={formatDate(expireDetail?.pucExpiry)} />
          <PrintField label="Fitness Expiry" value={formatDate(expireDetail?.fitnessExpiry)} />
          <PrintField label="Tax Expiry" value={formatDate(expireDetail?.taxExpiry)} />
          <PrintField label="Permit Expiry" value={formatDate(expireDetail?.permitExpiry)} />
        </Section2>

        <Section2 title="Transaction Details" className="pt-20">
          <PrintField label="To RTO" value={transactionDetail?.to} />
          <PrintField label="HPT Firm" value={transactionDetail?.hptFirmName} />
          <PrintField label="HPA Firm" value={transactionDetail?.hpaFirmName} />
          <PrintField label="Number Plate" value={transactionDetail?.numberPlate} />
          <PrintField label="Remarks" value={transactionDetail?.remarks} />

          <div className="col-span-full mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-semibold text-gray-700 mb-3">Transaction Services</h4>
            <div className="grid grid-cols-2 gap-4">
              <PrintField label="Fitness" value={getBool(transactionDetail?.fitness)} />
              <PrintField label="RRF" value={getBool(transactionDetail?.rrf)} />
              <PrintField label="RMA" value={getBool(transactionDetail?.rma)} />
              <PrintField label="Alteration" value={getBool(transactionDetail?.alteration)} />
              <PrintField label="Conversion" value={getBool(transactionDetail?.conversion)} />
              <PrintField label="Address Change" value={getBool(transactionDetail?.addressChange)} />
              <PrintField label="DRC" value={getBool(transactionDetail?.drc)} />
            </div>
          </div>
        </Section2>

        {ownerDetails && (
          <Section2 title="Ownership Transfer Details" className="pt-8 break-before-page">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                  Registered Owner Information
                </h4>
                <PrintField label="Registered Owner Name" value={ownerDetails?.sellerName} />
                <PrintField label="Registered Owner Aadhar" value={ownerDetails?.sellerAadharNo} />
                <PrintField label="Registered Owner Address" value={ownerDetails?.sellerAddress} />
                <PrintField label="Registered Owner State" value={ownerDetails?.sellerState} />
                <PrintField label="Registered Owner Phone" value={ownerDetails?.sellerPhoneNo} />
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-3 flex items-center">
                  New Owner Information
                </h4>
                <PrintField label="New Owner Name" value={ownerDetails?.buyerName} />
                <PrintField label="New Owner Aadhar" value={ownerDetails?.buyerAadharNo} />
                <PrintField label="New Owner Address" value={ownerDetails?.buyerAddress} />
                <PrintField label="New Owner State" value={ownerDetails?.buyerState} />
                <PrintField label="New Owner Phone" value={ownerDetails?.buyerPhoneNo} />
              </div>
            </div>
          </Section2>
        )}
        <Section2 title="Expense Details" className="pt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <span className="font-semibold text-xl text-gray-700 mb-3">Service Charges</span>
              <PrintField label="PUC Charges" value={expenseDetail?.pucCharges ? `₹${expenseDetail.pucCharges}` : "Not Alloted"} />
              <PrintField label="Insurance Charges" value={expenseDetail?.insuranceCharges ? `₹${expenseDetail.insuranceCharges}` : "Not Alloted"} />
              <PrintField label="Receipt Amount" value={expenseDetail?.receiptAmount ? `₹${expenseDetail.receiptAmount}` : "Not Alloted"} />
            </div>
            {user?.role === 'superadmin' && (
              <div>
                <span className="font-semibold text-xl text-gray-700 mb-3">Additional Charges</span>
                <PrintField label="Other Charges" value={expenseDetail?.otherCharges ? `₹${expenseDetail.otherCharges}` : "Not Alloted"} />
                <PrintField label="Admin Charges" value={expenseDetail?.adminCharges ? `₹${expenseDetail.adminCharges}` : "Not Alloted"} />
              </div>
            )}
          </div>
        </Section2>

        <Section2 title="Reference Details" className="pt-8">
          <PrintField label="Name" value={referenceDetail?.name} />
          <PrintField label="Contact" value={referenceDetail?.contact} />
        </Section2>

        {/* Summary Section */}
        {/* <div className="bg-white rounded-lg shadow-lg p-6 mt-8 border border-gray-200 pt-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <span className="w-2 h-2 bg-blue-600 rounded-full mr-2"></span>
            Case Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="font-medium text-blue-800">Vehicle Information</p>
              <p className="text-blue-600 font-semibold">{vehicleDetail?.vehicleNo || 'N/A'}</p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <p className="font-medium text-green-800">Firm</p>
              <p className="text-green-600 font-semibold">{generalDetail?.firmName || 'N/A'}</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <p className="font-medium text-purple-800">Total Charges</p>
              <p className="text-purple-600 font-semibold">
                ₹{(expenseDetail?.pucCharges || 0) + (expenseDetail?.insuranceCharges || 0) + (expenseDetail?.receiptAmount || 0)}
              </p>
            </div>
          </div>
        </div> */}
      </div>
    );
  };

  useEffect(() => {
    if (!caseId) {
      toast.showToast("Error", "No Case ID provided", "error");
      navigate(-1);
      return;
    }

    setLoading(true);
    getCaseID(caseId)
      .then((resp) => {
        setCaseData(resp?.data);
      })
      .catch((err) => {
        if (err?.status === 401 || err?.response?.status === 401) {
          toast.showToast("Error", "Session Expired", "error");
          logout();
        } else {
          toast.showToast("Error", err?.message || "Failed to fetch case data", "error");
        }
      })
      .finally(() => setLoading(false));
  }, []);



  const PrintField = ({ label, value }: { label: string; value?: string | number | boolean }) => {
    const isBoolean = typeof value === 'boolean' || value === 'Yes' || value === 'No';
    const isYes = value === true || value === 'Yes';

    return (
      <div className="flex justify-between items-center py-2 border-b border-gray-100">
        <span className="font-medium text-gray-700 min-w-[140px]">{label}</span>
        <span className={`font-semibold text-right flex-1 ${isBoolean
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


  if (!caseData) return null;

  const { CaseNo, generalDetail, vehicleDetail, expireDetail, transactionDetail, expenseDetail, ownerDetails,referenceDetail } = caseData;

  return (
    <>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex justify-start gap-4">
            <Button variant="outline" className="cursor-pointer" onClick={() => navigate(-1)}>← Back</Button>
            <Button
              type="button"
              style={{ cursor: "pointer" }}
              onClick={reactToPrintFn}
              className="bg-primary text-white sm:w-auto rounded px-4 py-2"
            >
              🖨️ Print PDF
            </Button>
          </div>
          {(caseData.status.toLowerCase() !== "assigned" && caseData.status.toLowerCase() !== "paid" && caseData.status.toLowerCase()!== "rejected") 
          &&
          (
          <Button className="cursor-pointer" onClick={() => navigate(`/${user?.role}/cases/${CaseNo}/edit`, { state: { caseData: caseData, id: caseId } })}>
            ✎ Edit
          </Button>)}
        </div>

        <h1 className="text-2xl font-bold mb-4">Case #{CaseNo}</h1>

        <Card className="mb-6">
          <CardHeader className="text-lg font-semibold">General Details</CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Firm Name</p>
              <p className="font-medium">{generalDetail?.firmName || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Appointment Date</p>
              <p className="font-medium">{formatDate(generalDetail?.appointmentDate) || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Application No.</p>
              <p className="font-medium">{generalDetail?.applicationNo || "—"}</p>
            </div>
            {user?.role === "superadmin" &&
              <div>
                <p className="text-sm text-muted-foreground">Incentive Amount</p>
                <p className="font-medium">{generalDetail?.incentiveAmount || "—"}</p>
              </div>}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="text-lg font-semibold">Vehicle Details</CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Vehicle No</p>
              <p className="font-medium">{vehicleDetail?.vehicleNo || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">From RTO</p>
              <p className="font-medium">{vehicleDetail?.fromRTO || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">To RTO</p>
              <p className="font-medium">{vehicleDetail?.toRTO || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Chassis No</p>
              <p className="font-medium">{vehicleDetail?.chassisNo || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Engine No</p>
              <p className="font-medium">{vehicleDetail?.engineNo || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">RMA Vehicle No</p>
              <p className="font-medium">{vehicleDetail?.rmaVehicleNo || "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="text-lg font-semibold">Expire Details</CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Insurance Expiry</p>
              <p className="font-medium">{formatDate(expireDetail?.insuranceExpiry) || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">PUC Expiry</p>
              <p className="font-medium">{formatDate(expireDetail?.pucExpiry) || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fitness Expiry</p>
              <p className="font-medium">{formatDate(expireDetail?.fitnessExpiry) || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Tax Expiry</p>
              <p className="font-medium">{formatDate(expireDetail?.taxExpiry) || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Permit Expiry</p>
              <p className="font-medium">{formatDate(expireDetail?.permitExpiry) || "—"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="text-lg font-semibold">Transaction Details</CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">To RTO</p>
              <p className="font-medium">{transactionDetail?.to || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">HPT ID</p>
              <p className="font-medium">{getFirmNameById(transactionDetail?.hptId) || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">HPA ID</p>
              <p className="font-medium">{getFirmNameById(transactionDetail?.hpaId) || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Insurance Type</p>
              <p className="font-medium">{getFirmNameById(transactionDetail?.insuranceType) || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Fitness</p>
              <p className="font-medium">{getBoolStatus(transactionDetail?.fitness)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">RRF</p>
              <p className="font-medium">{getBoolStatus(transactionDetail?.rrf)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">RMA</p>
              <p className="font-medium">{getBoolStatus(transactionDetail?.rma)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Alteration</p>
              <p className="font-medium">{getBoolStatus(transactionDetail?.alteration)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Conversion</p>
              <p className="font-medium">{getBoolStatus(transactionDetail?.conversion)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Number Plate Type</p>
              <p className="font-medium">{transactionDetail?.numberPlate || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address Change</p>
              <p className="font-medium">{getBoolStatus(transactionDetail?.addressChange)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">DRC</p>
              <p className="font-medium">{getBoolStatus(transactionDetail?.drc)}</p>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <p className="text-sm text-muted-foreground">Remarks</p>
              <p className="font-medium">{transactionDetail?.remarks || "—"}</p>
            </div>
          </CardContent>
        </Card>



        {ownerDetails && (
          <>
            <Card className="mb-6">
              <CardHeader className="text-lg font-semibold">Registered Owner Details</CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Registered Owner Name</p>
                  <p className="font-medium">{ownerDetails?.sellerName || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registered Owner Aadhar Number</p>
                  <p className="font-medium">{ownerDetails?.sellerAadharNo || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registered Owner Address</p>
                  <p className="font-medium">{ownerDetails?.sellerAddress || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registered Owner State</p>
                  <p className="font-medium">{ownerDetails?.sellerState || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Registered Owner Mobile Number</p>
                  <p className="font-medium">{ownerDetails?.sellerPhoneNo || "—"}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader className="text-lg font-semibold">New Owner Details</CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">New Owner Name</p>
                  <p className="font-medium">{ownerDetails?.buyerName || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">New Owner Aadhar Number</p>
                  <p className="font-medium">{ownerDetails?.buyerAadharNo || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">New Owner Address</p>
                  <p className="font-medium">{ownerDetails?.buyerAddress || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">New Owner State</p>
                  <p className="font-medium">{ownerDetails?.buyerState || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">New Owner Mobile Number</p>
                  <p className="font-medium">{ownerDetails?.buyerPhoneNo || "—"}</p>
                </div>
              </CardContent>
            </Card>
          </>
        )}
                    <Card className="mb-6">
              <CardHeader className="text-lg font-semibold">Expense Details</CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">PUC Charges</p>
                  <p className="font-medium">{expenseDetail?.pucCharges || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Insurance Charges</p>
                  <p className="font-medium">{expenseDetail?.insuranceCharges || "—"}</p>
                </div>
                {user?.role === 'superadmin'
                  &&
                  <>
                    <div>
                      <p className="text-sm text-muted-foreground">Other Charges</p>
                      <p className="font-medium">{expenseDetail?.otherCharges || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Admin Charges</p>
                      <p className="font-medium">{expenseDetail?.adminCharges || "—"}</p>
                    </div>
                  </>
                }
                <div>
                  <p className="text-sm text-muted-foreground">Receipt Amount</p>
                  <p className="font-medium">{expenseDetail?.receiptAmount || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Expense Remarks</p>
                  <p className="font-medium">{expenseDetail?.expenseRemarks || "—"}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="mb-6">
              <CardHeader className="text-lg font-semibold">Reference Details</CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Reference Name</p>
                  <p className="font-medium">{referenceDetail?.name || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Reference Number</p>
                  <p className="font-medium">{referenceDetail?.contactNo || "—"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Document Link</p>
                  <p className="font-medium">
                  {referenceDetail?.documentLink
                    ? (
                    <a
                      href={referenceDetail.documentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline"
                    >
                      View Document
                    </a>
                    )
                    : "—"}
                  </p>
                </div>
              </CardContent>
            </Card>
      </div>

      <div ref={contentRef} className="hidden print:block text-sm leading-relaxed printable-section">
        <PrintableCaseDetails
          caseNo={CaseNo}
          generalDetail={generalDetail}
          vehicleDetail={vehicleDetail}
          expireDetail={expireDetail}
          transactionDetail={{
            ...transactionDetail,
            hptFirmName: getFirmNameById(transactionDetail?.hptId),
            hpaFirmName: getFirmNameById(transactionDetail?.hpaId),
          }}
          ownerDetails={ownerDetails}
          expenseDetail={expenseDetail}
          referenceDetail={referenceDetail}
        />
      </div>
    </>
  );
}
