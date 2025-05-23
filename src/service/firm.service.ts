import axios from "axios";
import { getConfig,url} from "@/service/auth.service";
import type { Firm } from "@/components/FirmForm";

export const getFirm = async () => {
  const config = getConfig();
  return axios
    .get(url + "/utils/firms/all", config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};

export async function createFirm(firmData: any): Promise<Firm> {
    const token = localStorage.getItem("token"); // Assuming user is logged in
    try {
        const response = await axios.post(
            `${url}/utils/create-firm`,
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

export async function toggleFirm(firmId: string): Promise<boolean> {
    if (firmId === undefined || firmId === null) {
        throw new Error("firmId is required and was not provided.");
    }
    const token = localStorage.getItem("token");
    try {
        const response = await axios.post(
            `${url}/utils/toggle-firm-visibility/${firmId}`,
            { firmId },
            {
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { "Authorization": `Bearer ${token}` }),
                },
            }
        );
        const result = response.data;

        if (!response.status || !result.success) {
            throw new Error(result?.errors?.message || result?.message || "Failed to create Firm");
        }

        return result.data?.isActive;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message || "Failed to create Firm");
    }
}