import axios from "axios";
import { url } from "@/service/auth.service";
import { type Case } from "@/components/CaseForm";

export async function createCase(CaseData: any){
    const token = localStorage.getItem("token"); // Assuming user is logged in
    try {
        const response = await axios.post(
            `${url}/case/new`,
            CaseData,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            }
        );
        const result = response.data;

        if (!response.status || !result.success) {
            throw new Error(result.message || "Failed to create Case");
        }

        return result || "Case created successfully";
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message || "Failed to create Case");
    }
}