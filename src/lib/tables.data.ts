// import React from "react";
import { type ColumnDef } from "@tanstack/react-table";
// import {type User } from "@/context/AuthContext";
import { type Branch } from "@/components/Branchform";
import { type CaseDetails } from "@/components/CaseDesAdmin";
import type { Employee } from "@/components/EmployeeForm";
import type { Firm } from "@/components/FirmForm";
import type { RTO } from "@/components/RTOComp";

export type CaseData = {
  id: string;
  caseNo: number;
  createdAt: string;
  expiryDate: string;
  vehicleDetail: {
    vehicleNo: string;
  };
};

  export type Transaction = {
    id: string;
    Amount: string;
    mode: string;
    paymentDate: string;
    status: string;
    remark: string;
  };

export interface Payment {
  id: string;
  amount: string;
  remarks: string;
  mode: string;
  paymentDate: string;
}

export const paymentColumns: ColumnDef<Payment>[] = [
    {
    // accessorKey: "paymentDate",
    header: "Payment Date",
        cell: ({ row }) => {
      const date = new Date(row.original.paymentDate);
      return date.toLocaleString();
    },
  },
    {
    accessorKey: "mode",
    header: "Mode",
    cell: ({ row }) => row.original.mode,
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    cell: ({ row }) => row.original.remarks.replace(/_/g, " "),
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => `₹${row.original.amount}`,
  },
];

export const branchTableColumns: ColumnDef<Branch>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    id: "address",
    header: "Address",
    accessorFn: (row) => `${row.address1}, ${row.address2}, ${row.city}, ${row.state}, ${row.pincode}`,
    cell: ({ row }) => {
      const branch = row.original;
      return `${branch.address1}, ${branch.address2}, ${branch.city}, ${branch.state}, ${branch.pincode}`;
    },
  },
];
export const rtoTableColumns: ColumnDef<RTO>[] = [
  {
    accessorKey: "rtoCode",
    header: "Code",
  },
  {
    accessorKey: "city",
    header: "City",
  },
];

export const caseTableColumns: ColumnDef<CaseDetails>[] = [
  {
    // accessorKey: "CaseNo",
    header: "Case No.",
    accessorFn: (row) => `#${row?.CaseNo}`,
    cell: ({ row }) => "#" + `${row.original.CaseNo}`,
  },
  {
    id: "vehicleNo",
    header: "Vehicle No.",
    accessorFn: (row) =>`${row.vehicleDetail.vehicleNo}`,
    cell: ({ row }) => row.original.vehicleDetail?.vehicleNo ?? "-",
  },
  {
    id: "createdBy",
    header: "Created By",
    accessorFn: (row)=>`${row.createdBy.firstName} ${row.createdBy.lastName}`,
    cell: ({ row }) => {
      const { firstName, lastName, employeeCode } = row.original.createdBy;
      return employeeCode
        ? `${firstName} ${lastName} | ${employeeCode}`
        : `${firstName} ${lastName}`;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
  },
{
  id: "assignedTo",
  header: "Assigned To",
  accessorFn: (row) =>
    row.assignedTo
      ? `${row.assignedTo.firstName} ${row.assignedTo.lastName}`
      : "-",
  cell: ({ row }) => {
    const assignedTo = row.original?.assignedTo;
    return assignedTo
      ? `${assignedTo.firstName} ${assignedTo.lastName}`
      : "-";
  },
},


];


export const caseColumns: ColumnDef<any>[] = [
  {
    accessorKey: "CaseNo",
    accessorFn: (row) => `#${row?.CaseNo}`,
    header: "Case No.",
  },
  {
    // accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return date.toLocaleString();
    },
  },
  {
    accessorKey: "status",
    accessorFn: (row) => `${row?.status}`,
    header: "Status",
  },
  {
    accessorKey: "generalDetail.applicationNo",
    header: "Application No.",
    cell: ({ row }) => row.original.generalDetail?.applicationNo ?? "N/A",
  },
  {
    accessorKey: "generalDetail.appointmentDate",
    header: "Appointment Date",
    cell: ({ row }) => row.original.generalDetail?.appointmentDate ?? "N/A",
  },
  {
    accessorKey: "generalDetail.incentiveAmount",
    header: "Incentive Amount",
    cell: ({ row }) => `₹ ${row.original.generalDetail?.incentiveAmount ?? "0.00"}`,
  },
  {
    accessorKey: "vehicleDetail.vehicleNo",
    header: "Vehicle No.",
    cell: ({ row }) => row.original.vehicleDetail?.vehicleNo ?? "N/A",
  },
];

export const clientTransactioncolumns: ColumnDef<Transaction>[] = [
    {
    // accessorKey: "paymentDate",
    header: "Date",
     cell: ({ row }) => new Date(row.original.paymentDate).toLocaleDateString(),
  },
  {
    accessorKey: "mode",
    header: "Mode",
    cell: ({ row }) => (row.original.mode).toUpperCase(),
  },
    {
    accessorKey: "remark",
    header: "Particulars",
    cell: ({ row }) => (row.original.mode).toUpperCase(),
  },

    {
    // accessorKey: "Amount",
    accessorFn: (row) => `${row.Amount}`,
    header: "Amount (₹)",
    cell: ({ row }) => `₹${parseFloat(row.original.Amount).toFixed(2)}`,
  },
  {
    accessorKey: "status",
    header: "Status",
  },
];

export const allCaseColumns:ColumnDef<CaseData>[] = [
  {
    // accessorKey: "caseNo",
    accessorFn: (row) => `#${row?.caseNo}`,
    header: "Case No",
  },
  {
    accessorKey: "vehicleDetail.vehicleNo",
    header: "Vehicle No",
    cell: ({ row }) => row.original.vehicleDetail.vehicleNo,
  },
  {
    // accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    // accessorKey: "expiryDate",
    header: "Expiry Date",
    cell: ({ row }) => new Date(row.original.expiryDate).toLocaleDateString(),
  },
];

export const employeeCaseTableColumns: ColumnDef<CaseDetails>[] = [
  {
    // accessorKey: "CaseNo",
    header: "No.",
    accessorFn: (row) => `#${row?.CaseNo}`,
    cell: ({ row }) => `#${row.original.CaseNo}`,
  },
  {
    id: "vehicleNo",
    header: "Vehicle No.",
    accessorFn: (row) => row.vehicleDetail?.vehicleNo ?? "-",
    cell: ({ row }) => row.original.vehicleDetail?.vehicleNo ?? "-",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
];

export const employeeTableColumns: ColumnDef<Employee>[] = [
  {
    id: "name",
    header: "Name",
    accessorFn: (row)=>`${row.firstName} ${row.lastName}`,
    cell: ({ row }) => {
      const { firstName, lastName } = row.original;
      return `${firstName} ${lastName}`;
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phoneNo",
    header: "Phone No.",
  },
  {
    accessorKey: "branchCode",
    header: "BranchCode",
  },
];

export const firmTableColumns: ColumnDef<Firm>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
];
