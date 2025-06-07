import { useState, useEffect } from "react";
import { useLoading } from "./LoadingContext";
import { getAllCasesE } from "@/service/case.service";
import { useNavigate } from "react-router-dom";
import { type CaseDetails } from "@/components/CaseDesAdmin"
import { useForm } from "react-hook-form";
import { FaEye } from "react-icons/fa";
import { useToast } from "@/context/ToastContext";
import { DataTable } from "./DataTable";
import { employeeCaseTableColumns } from "@/lib/tables.data";

export default function CaseDes() {
  useForm<CaseDetails>();
  const navigate = useNavigate(); // ✅ Add this

  const [cases, setCases] = useState<CaseDetails[]>([]);
  const { setLoading } = useLoading();
  const toast = useToast();

  useEffect(() => {
    setLoading(true);
    getAllCasesE()
      .then((resp) => {
        setCases(resp?.data)})
      .catch((err: any) => {
        toast.showToast('Error fetching cases:',err,'error');
        // console.error("Error fetching cases:", err)
        })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
     <DataTable columns={[...employeeCaseTableColumns,
{
    id: "action",
    header: "Action",
    cell: ({ row }) => {
      const data = row.original;

      return (
        <button
          type="button"
          title="View Details"
          onClick={() =>
            navigate(`/employee/cases/${data.CaseNo}`, {
              state: { id: data.id },
            })
          }
          className="text-black hover:text-blue-600 transition-colors"
          style={{ background: "none", border: "none", fontSize: "1.2rem",cursor:"pointer" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#007bff")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#000")}
        >
          <FaEye />
        </button>
      );
    },
  },
      ]} data={cases} />
    </div>
  );
}