// import React from "react";
import { type ColumnDef } from "@tanstack/react-table";
// import {type User } from "@/context/AuthContext";
import { type Branch } from "@/components/Branchform";
import { type CaseDetails } from "@/components/CaseDesAdmin";
import type { Employee } from "@/components/EmployeeForm";
import type { Firm } from "@/components/FirmForm";


export const branchTableColumns: ColumnDef<Branch>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    id: "address",
    header: "Address",
    cell: ({ row }) => {
      const branch = row.original;
      return `${branch.address1}, ${branch.address2}, ${branch.city}, ${branch.state}, ${branch.pincode}`;
    },
  },
];

export const caseTableColumns: ColumnDef<CaseDetails>[] = [
  {
    accessorKey: "CaseNo",
    header: "No.",
    cell: ({ row }) => `#${row.original.CaseNo}`,
  },
  {
    id: "vehicleNo",
    header: "Vehicle No.",
    cell: ({ row }) => row.original.vehicleDetail?.vehicleNo ?? "-",
  },
  {
    id: "createdBy",
    header: "Created By",
    cell: ({ row }) => {
      const { firstName, lastName, employeeCode } = row.original.createdBy;
      return `${firstName} ${lastName} | ${employeeCode}`;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
  },
];

export const employeeCaseTableColumns: ColumnDef<CaseDetails>[] = [
  {
    accessorKey: "CaseNo",
    header: "No.",
    cell: ({ row }) => `# ${row.original.CaseNo}`,
  },
  {
    id: "vehicleNo",
    header: "Vehicle No.",
    cell: ({ row }) => row.original.vehicleDetail?.vehicleNo ?? "-",
  },
  {
    accessorKey: "status",
    header: "Status",
  }
];

export const employeeTableColumns: ColumnDef<Employee>[] = [
  {
    id: "name",
    header: "Name",
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
  }
];

