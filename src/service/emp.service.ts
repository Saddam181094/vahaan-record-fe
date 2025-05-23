import type { Employee } from "@/components/EmployeeForm";
import axios from "axios";
import { url } from "@/service/auth.service";

export async function createEmployee(firmData: any): Promise<Employee> {
    const token = localStorage.getItem("token"); // Assuming user is logged in
    try {
        const response = await axios.post(
            `${url}/auth/add-user`,
            firmData,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            }
        );
        const result = response.data;

        if (!response.status || !result.success) {
            throw new Error(result.message || "Failed to create Firm");
        }

        return result.data || "Firm created successfully";
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message || "Failed to create Firm");
    }
}