import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useForm,Controller } from "react-hook-form";
import type { Branch } from "@/components/Branchform";
import { getActiveBranch } from "@/service/branch.service";
import type { Employee } from "@/components/EmployeeForm";
import type { Firm } from "@/components/FirmForm";
import { getbranchEmployee } from "@/service/emp.service";
import { getActiveFirm } from "@/service/firm.service";

// Interfaces
export interface Case {
  generalDetails: GeneralDetails;
  vehicleDetail: VehicleDetail;
  expireDetail: ExpireDetail;
  transactionDetail: TransactionDetail;
  expenseDetail: ExpenseDetail;
}

export interface GeneralDetails {
  firmName: string;
  branchCodeId: string;
  employeeCodeId: string;
  dealerCode: string | null;
  incentiveType: number;
}

export interface VehicleDetail {
  vehicleNo: string;
  fromRTO: string;
  toRTO: string;
  chassisNo: string;
  engineNo: string;
}

export interface ExpireDetail {
  insuranceExpiry: string;
  pucExpiry: string;
  fitnessExpiry: string;
  taxExpiry: string;
  permitExpiry: string;
}

export interface TransactionDetail {
  to: TransactionTo;
  hptId: string;
  hpaId: string;
  fitness: boolean;
  rrf: boolean;
  rma: boolean;
  alteration: boolean;
  conversion: boolean;
  numberPlate: NumberPlate;
  addressChange: boolean;
  drc: boolean;
  remarks: string;
}

export interface ExpenseDetail {
  pucCharges: number;
  insuranceCharges: number;
  otherCharges: number;
  adminCharges: number;
}

export const TransactionTo = {
  LOCAL: "LOCAL",
  OTHER: "OTHER",
  NA: "NA",
} as const;
export type TransactionTo = (typeof TransactionTo)[keyof typeof TransactionTo];

export const NumberPlate = {
  HSRP: "HSRP",
  NON_HSRP: "NON HSRP",
  NA: "NA",
} as const;
export type NumberPlate = (typeof NumberPlate)[keyof typeof NumberPlate];

export default function CaseForm() {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<Case>({
    defaultValues: {
      generalDetails: {
        firmName: "",
        branchCodeId: "",
        employeeCodeId: "",
        dealerCode: "",
        incentiveType: 1,
      },
      vehicleDetail: {
        vehicleNo: "",
        fromRTO: "",
        toRTO: "",
        chassisNo: "",
        engineNo: "",
      },
      expireDetail: {
        insuranceExpiry: "",
        pucExpiry: "",
        fitnessExpiry: "",
        taxExpiry: "",
        permitExpiry: "",
      },
      transactionDetail: {
        to: "" as unknown as TransactionTo,
        hptId: "",
        hpaId: "",
        fitness: false,
        rrf: false,
        rma: false,
        alteration: false,
        conversion: false,
        numberPlate: "" as unknown as NumberPlate,
        addressChange: false,
        drc: false,
        remarks: "",
      },
      expenseDetail: {
        pucCharges: 0,
        insuranceCharges: 0,
        otherCharges: 0,
        adminCharges: 0,
      },
    },
  });

  const [branches, setBranches] = useState<Branch[]>([]);
  const [b, setB] = useState<string>("");
  const [branchEmp, setbranchEmp] = useState<Employee[]>([]);
  const [firms, setfirms] = useState<Firm[]>([]);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);

  useEffect(() => {
    setLoading(true);
    setLoading2(true);
    getActiveBranch()
      .then((resp) => {
        setBranches(resp?.data);
      })
      .catch((err: any) => {
        console.error("Error fetching branches:", err);
      })
      .finally(() => {
        setLoading(false);
        setLoading2(false);
      });
  }, [refreshFlag]);

  useEffect(() => {
    setLoading(true);
    setLoading2(true);

    if(b !== "") {
    getbranchEmployee(b)
      .then((resp) => {
        setbranchEmp(resp?.data);
      })
      .catch((err: any) => {
        console.error("Error fetching branches:", err);
      })
      .finally(() => {
        setLoading(false);
        setLoading2(false);
      });
      }
  }, [refreshFlag]);

  

  useEffect(() => {
    setLoading(true);
    getActiveFirm()
      .then((resp) => {
        setfirms(resp?.data);
      })
      .catch((err: any) => {
        console.error("Error fetching firms:", err);
      })
      .finally(() => setLoading(false));
  }, [refreshFlag]);

  // Add a submit handler function
  const onSubmit = (data: Case) => {
    // handle form submission, e.g., send data to API
    console.log(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-6">
      {/* General Details */}
      <Card>
        <CardContent className="grid gap-4">
          <div className="text-xl font-semibold">General Details</div>
          <div className="flex gap-5 flex-col md:flex-row">
            <Input
              placeholder="Firm Name"
              className="w-[50%]"
              {...register("generalDetails.firmName")}
            />
            <Select
              value={watch("generalDetails.branchCodeId")}
              onValueChange={(val) => {
                setValue("generalDetails.branchCodeId", val);
                setB(val);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Branch" >
                    {watch("generalDetails.branchCodeId")}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {branches.map((branch) => (
                  <SelectItem key={branch?.id} value={branch?.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={watch("generalDetails.employeeCodeId")}
              onValueChange={(val) =>
                setValue("generalDetails.employeeCodeId", val)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Employee" />
              </SelectTrigger>
              <SelectContent>
                {branchEmp.map((emp) => (
                  <SelectItem
                    key={emp?.branchCode ?? ""}
                    value={emp?.branchCode ?? ""}
                  >
                    {emp.firstName} {emp.lastName} | ({emp.branchCode})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* <Input
              placeholder="Dealer Code"
              {...register("generalDetails.dealerCode")}
            /> */}
          </div>
          {/* <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              value={String(formData.generalDetails.incentiveType)}
              onValueChange={(val) => handleChange("generalDetails", "incentiveType", Number(val))}
            >
              <SelectTrigger><SelectValue placeholder="Select Incentive Type" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Fixed</SelectItem>
                <SelectItem value="2">Variable</SelectItem>
              </SelectContent>
            </Select>
          </div> */}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 p-6">
          <div className="text-xl font-semibold">Vehicle Detail</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="vehicleNo" className="pb-2">
                Vehicle No
              </Label>
              <Input
                id="vehicleNo"
                placeholder="Vehicle No"
                {...register("vehicleDetail.vehicleNo")}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="fromRTO" className="pb-2">
                From RTO
              </Label>
              <Input
                id="fromRTO"
                placeholder="From RTO"
                {...register("vehicleDetail.fromRTO")}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="toRTO" className="pb-2">
                To RTO
              </Label>
              <Input
                id="toRTO"
                placeholder="To RTO"
                {...register("vehicleDetail.toRTO")}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="chassisNo" className="pb-2">
                Chassis No
              </Label>
              <Input
                id="chassisNo"
                placeholder="Chassis No"
                {...register("vehicleDetail.chassisNo")}
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="engineNo" className="pb-2">
                Engine No
              </Label>
              <Input
                id="engineNo"
                placeholder="Engine No"
                {...register("vehicleDetail.engineNo")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 p-6">
          <div className="text-xl font-semibold">Expire Detail</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Object.entries(watch("expireDetail")).map(([key, value]) => {
              const date = value ? new Date(value as string) : undefined;
              return (
                <div key={key} className="flex flex-col gap-1">
                  <label className="text-sm font-medium capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        {date ? format(date, "yyyy-MM-dd") : `Pick a date`}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(selectedDate) => {
                          if (selectedDate) {
                            setValue(
                              `expireDetail.${key}` as any,
                              selectedDate.toISOString().split("T")[0]
                            );
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 p-6">
          <div className="text-xl font-semibold">Transaction Detail</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Select
              value={watch("transactionDetail.to")}
              onValueChange={(val) =>
                setValue("transactionDetail.to", val as any)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="To" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(TransactionTo).map((val) => (
                  <SelectItem key={val} value={val}>
                    {val}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={watch("transactionDetail.hptId")}
              onValueChange={(val) => setValue("transactionDetail.hptId", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select HPT ID" />
              </SelectTrigger>
              <SelectContent>
                {firms.map((firm) => (
                  <SelectItem key={firm.id} value={firm.id}>
                    {firm.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={watch("transactionDetail.hpaId")}
              onValueChange={(val) => setValue("transactionDetail.hpaId", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select HPA ID" />
              </SelectTrigger>
              <SelectContent>
                {firms.map((firm) => (
                  <SelectItem key={firm.id} value={firm.id}>
                    {firm.name} 
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={watch("transactionDetail.numberPlate")}
              onValueChange={(val) =>
                setValue("transactionDetail.numberPlate", val as any)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Number Plate" />
              </SelectTrigger>
              <SelectContent>
                {Object.values(NumberPlate).map((val) => (
                  <SelectItem key={val} value={val}>
                    {val}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(
              ["fitness", "rrf", "rma", "alteration"] as Array<
                keyof Pick<
                  TransactionDetail,
                  "fitness" | "rrf" | "rma" | "alteration"
                >
              >
            ).map((key) => (
              <div key={key} className="flex items-center space-x-2">
                <Switch
                  checked={watch(`transactionDetail.${key}`)}
                  onCheckedChange={(val) =>
                    setValue(`transactionDetail.${key}` as any, val)
                  }
                />
                <Label>{key.toUpperCase()}</Label>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(
              ["conversion", "addressChange", "drc"] as Array<
                keyof Pick<
                  TransactionDetail,
                  "conversion" | "addressChange" | "drc"
                >
              >
            ).map((key) => (
              <div key={key} className="flex items-center space-x-2">
                <Switch
                  checked={watch(`transactionDetail.${key}`)}
                  onCheckedChange={(val) =>
                    setValue(`transactionDetail.${key}` as any, val)
                  }
                />
                <Label>{key.toUpperCase()}</Label>
              </div>
            ))}
            <Textarea
              className="col-span-1 md:col-span-4"
              placeholder="Remarks"
              {...register("transactionDetail.remarks")}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="grid gap-4 p-6">
          <div className="text-xl font-semibold">Expense Detail</div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {(
              [
                "pucCharges",
                "insuranceCharges",
                "otherCharges",
                "adminCharges",
              ] as const
            ).map((key) => (
              <Input
                key={key}
                type="number"
                placeholder={key}
                {...register(`expenseDetail.${key}`, { valueAsNumber: true })}
              />
            ))}
          </div>
        </CardContent>
      </Card>
      <Button type="submit">Submit Case</Button>
    </form>
  );
}
