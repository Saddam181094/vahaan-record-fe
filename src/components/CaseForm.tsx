import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {toast} from "sonner";
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
// import type { Employee } from "@/components/EmployeeForm";
import { useLoading } from "./LoadingContext";
import type { Firm } from "@/components/FirmForm";
import { getbranchEmployee } from "@/service/emp.service";
import { getActiveFirm } from "@/service/firm.service";
import { createCase } from "@/service/case.service";

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
  pucCharges: string;
  insuranceCharges: string;
  otherCharges: string;
  adminCharges: string;
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
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: {},
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
        pucCharges: "",
        insuranceCharges: "",
        otherCharges: "",
        adminCharges: "",
      },
    },

    mode:'onSubmit',
  });

  type BranchEmployee = {
    id: string
    name: string
  }

  const [branches, setBranches] = useState<Branch[]>([]);
  const [b, setB] = useState<string>("");
  const {setLoading} = useLoading();
  const [branchEmp, setbranchEmp] = useState<BranchEmployee[]>([]);
  const [firms, setfirms] = useState<Firm[]>([]);

  // const expireDetail = watch("expireDetail");

  const [refreshFlag] = useState(false);

  useEffect(() => {
    setLoading(true);
    getActiveBranch()
      .then((resp) => {
        setBranches(resp?.data);
      })
      .catch((err: any) => {
        console.error("Error fetching branches:", err);
      })
      .finally(() => {
setLoading(false);
      });
  }, [refreshFlag]);

  useEffect(() => {
    setLoading(true);

    if (b !== "") {
      getbranchEmployee(b)
        .then((resp) => {
          setbranchEmp(resp?.data);
        })
        .catch((err: any) => {
          console.error("Error fetching branches:", err);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [refreshFlag, b]);



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
  const onSubmit = (data: any) => {
    // handle form submission, e.g., send data to API
    setLoading(true);
    createCase(data)
      .then((resp) => {

        if(resp)
        toast.success("Case Has been Created.");

        else
        toast.error("Case Not created Due to error");
      })
      .finally(() => 
      {
      setLoading(false);
      reset();
      });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 p-6">
      {/* General Details */}
      <Card>
      <CardContent className="grid gap-4">
        <div className="text-xl font-semibold">General Details</div>
        <hr></hr>
        <div className="flex gap-5 flex-col md:flex-row">
        <Input
          required
          placeholder="Firm Name"
          className="w-[25%]"
          {...register("generalDetails.firmName", { required: true })}
        />
        <Select
        required
          value={watch("generalDetails.branchCodeId")}
          onValueChange={(val) => {
          setValue("generalDetails.branchCodeId", val, { shouldValidate: true });
          setB(val);
          }}
        >
          <SelectTrigger>
          <SelectValue placeholder="Select Branch">
            {watch("generalDetails.branchCodeId")}
          </SelectValue>
          </SelectTrigger>
          <SelectContent>
          {branches.map((branch) => (
            <SelectItem key={branch?.branchCode} value={branch?.branchCode || 'default'}>
            {branch.name} -
            {branch?.branchCode}
            </SelectItem>
          ))}
          </SelectContent>
        </Select>
        <Select
        required
          value={watch("generalDetails.employeeCodeId")}
          onValueChange={(val) =>
          setValue("generalDetails.employeeCodeId", val, { shouldValidate: true })
          }
        >
          <SelectTrigger>
          <SelectValue placeholder="Select Employee" />
          </SelectTrigger>
          <SelectContent>
          {branchEmp.map((emp) => (
            <SelectItem
            key={emp?.id ?? ""}
            value={emp?.id ?? ""}
            >
            {emp?.name}
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
        <hr></hr>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Controller
          name="vehicleDetail.vehicleNo"
          control={control}
          rules={{ required: "Vehicle No. is required" }}
          render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1">
          <Label htmlFor="vehicleNo" className="pb-2">
            Vehicle No
          </Label>
          <Input
            id="vehicleNo"
            placeholder="Vehicle No"
            {...field}
          />
          {fieldState.error && (
            <p className="text-red-600 text-xs mt-1">{fieldState.error.message}</p>
          )}
        </div>
          )}
        />
        <Controller
          name="vehicleDetail.fromRTO"
          control={control}
          rules={{ required: "From RTO is required" }}
          render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1">
          <Label htmlFor="fromRTO" className="pb-2">
            From RTO
          </Label>
          <Input
            id="fromRTO"
            placeholder="From RTO"
            {...field}
          />
          {fieldState.error && (
            <p className="text-red-600 text-xs mt-1">{fieldState.error.message}</p>
          )}
        </div>
          )}
        />
        <Controller
          name="vehicleDetail.toRTO"
          control={control}
          rules={{ required: "To RTO is required" }}
          render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1">
          <Label htmlFor="toRTO" className="pb-2">
            To RTO
          </Label>
          <Input
            id="toRTO"
            placeholder="To RTO"
            {...field}
          />
          {fieldState.error && (
            <p className="text-red-600 text-xs mt-1">{fieldState.error.message}</p>
          )}
        </div>
          )}
        />
        <Controller
          name="vehicleDetail.chassisNo"
          control={control}
          rules={{ required: "Chassis No is required" }}
          render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1">
          <Label htmlFor="chassisNo" className="pb-2">
            Chassis No
          </Label>
          <Input
            id="chassisNo"
            placeholder="Chassis No"
            {...field}
          />
          {fieldState.error && (
            <p className="text-red-600 text-xs mt-1">{fieldState.error.message}</p>
          )}
        </div>
          )}
        />
        <Controller
          name="vehicleDetail.engineNo"
          control={control}
          rules={{ required: "Engine No is required" }}
          render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1">
          <Label htmlFor="engineNo" className="pb-2">
            Engine No
          </Label>
          <Input
            id="engineNo"
            placeholder="Engine No"
            {...field}
          />
          {fieldState.error && (
            <p className="text-red-600 text-xs mt-1">{fieldState.error.message}</p>
          )}
        </div>
          )}
        />
        </div>
      </CardContent>
      </Card>

          <Card>
  <CardContent className="grid gap-4 p-6">
    <div className="text-xl font-semibold">Expire Detail</div>
    <hr />
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <Controller
      name="expireDetail.insuranceExpiry"
      control={control}
      rules={{ required: 'Parameter is required.' }}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1">
        <Label htmlFor="insuranceExpiry" className="text-sm font-medium capitalize">
          Insurance Expiry
        </Label>
        <Input
          id="insuranceExpiry"
          type="date"
          className={`input input-bordered ${fieldState.error ? 'input-error' : ''}`}
          {...field}
        />
        {fieldState.error && (
          <p className="text-red-500 text-xs mt-1">
          {fieldState.error.message}
          </p>
        )}
        </div>
      )}
      />
      <Controller
      name="expireDetail.pucExpiry"
      control={control}
      rules={{ required: 'Parameter is required.' }}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1">
        <Label htmlFor="pucExpiry" className="text-sm font-medium capitalize">
          PUC Expiry
        </Label>
        <Input
          id="pucExpiry"
          type="date"
          className={`input input-bordered ${fieldState.error ? 'input-error' : ''}`}
          {...field}
        />
        {fieldState.error && (
          <p className="text-red-500 text-xs mt-1">
          {fieldState.error.message}
          </p>
        )}
        </div>
      )}
      />
      <Controller
      name="expireDetail.fitnessExpiry"
      control={control}
      rules={{ required: 'Parameter is required.' }}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1">
        <Label htmlFor="fitnessExpiry" className="text-sm font-medium capitalize">
          Fitness Expiry
        </Label>
        <Input
          id="fitnessExpiry"
          type="date"
          className={`input input-bordered ${fieldState.error ? 'input-error' : ''}`}
          {...field}
        />
        {fieldState.error && (
          <p className="text-red-500 text-xs mt-1">
          {fieldState.error.message}
          </p>
        )}
        </div>
      )}
      />
      <Controller
      name="expireDetail.taxExpiry"
      control={control}
      rules={{ required: 'Parameter is required.' }}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1">
        <Label htmlFor="taxExpiry" className="text-sm font-medium capitalize">
          Tax Expiry
        </Label>
        <Input
          id="taxExpiry"
          type="date"
          className={`input input-bordered ${fieldState.error ? 'input-error' : ''}`}
          {...field}
        />
        {fieldState.error && (
          <p className="text-red-500 text-xs mt-1">
          {fieldState.error.message}
          </p>
        )}
        </div>
      )}
      />
      <Controller
      name="expireDetail.permitExpiry"
      control={control}
      rules={{ required: 'Parameter is required.' }}
      render={({ field, fieldState }) => (
        <div className="flex flex-col gap-1">
        <Label htmlFor="permitExpiry" className="text-sm font-medium capitalize">
          Permit Expiry
        </Label>
        <Input
          id="permitExpiry"
          type="date"
          className={`input input-bordered ${fieldState.error ? 'input-error' : ''}`}
          {...field}
        />
        {fieldState.error && (
          <p className="text-red-500 text-xs mt-1">
          {fieldState.error.message}
          </p>
        )}
        </div>
      )}
      />
    </div>
  </CardContent>
</Card>

      <Card>
      <CardContent className="grid gap-4 p-6 space-y-2">
        <div className="text-xl font-semibold">Transaction Detail</div>
        <hr></hr>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="flex flex-col gap-1">
          <Label className="py-2">To</Label>
          <Select
          required
          value={watch("transactionDetail.to")}
          onValueChange={(val) =>
          setValue("transactionDetail.to", val as any,{shouldValidate:true})
          }
          >
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {Object.values(TransactionTo).map((val) => (
            <SelectItem key={val} value={val}>
              {val}
            </SelectItem>
            ))}
          </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="py-2">HPT ID</Label>
          <Select
          required
          value={watch("transactionDetail.hptId")}
          onValueChange={(val) => setValue("transactionDetail.hptId", val,{shouldValidate:true})}
          >
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {firms.map((firm) => (
            <SelectItem key={firm.id} value={firm.id}>
              {firm.name}
            </SelectItem>
            ))}
          </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="py-2">HPA ID</Label>
          <Select
          required
          value={watch("transactionDetail.hpaId")}
          onValueChange={(val) => setValue("transactionDetail.hpaId", val,{shouldValidate:true})}
          >
          <SelectTrigger>
            <SelectValue placeholder="Select" />
          </SelectTrigger>
          <SelectContent>
            {firms.map((firm) => (
            <SelectItem key={firm.id} value={firm.id}>
              {firm.name}
            </SelectItem>
            ))}
          </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1">
          <Label className="py-2">Number Plate</Label>
          <Select
          required
          value={watch("transactionDetail.numberPlate")}
          onValueChange={(val) =>
            setValue("transactionDetail.numberPlate", val as any)
          }
          >
          <SelectTrigger>
            <SelectValue placeholder="Select" />
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
          required
          className="col-span-1 md:col-span-4"
          placeholder="Remarks"
          {...register("transactionDetail.remarks", { required: true })}
        />
        </div>
      </CardContent>
      </Card>

      <Card>
      <CardContent className="grid gap-4 p-6">
        <div className="text-xl font-semibold border-b-2">Expense Detail</div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(
          [
          "pucCharges",
          "insuranceCharges",
          "otherCharges",
          ] as const
        ).map((key) => (
          <div key={key} className="flex flex-col gap-1">
          <Label className="py-3" htmlFor={key}>
            {key
            .replace(/([A-Z])/g, " $1")
            .replace(/^./, (str) => str.toUpperCase())}
          </Label>
          <Input
            required
            id={key}
            type="number"
            placeholder="Enter a value"
            {...register(`expenseDetail.${key}`, {
            required: true,
            valueAsNumber: true,
            setValueAs: (v) => (v === "" || v === null ? 0 : Number(v)),
            })}
          />
          </div>
        ))}
        </div>
      </CardContent>
      </Card>
      <Button type="submit">Submit Case</Button>
    </form>
  );
}
