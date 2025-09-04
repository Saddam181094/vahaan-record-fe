import axios, { type AxiosRequestConfig } from "axios";
import { getConfig,url} from "@/service/auth.service";
import type { Branch } from "@/components/Branchform";

export const getFormDataConfig = (): AxiosRequestConfig => {
  const t = localStorage.getItem("token");
  return {
    headers: {
      "Content-Type": "multipart/form-data",
      Accept: "application/json",
      Authorization: `Bearer ${t}`,
    },
  } as AxiosRequestConfig;
};

export const getBranch = async () => {
  const config = getConfig();
  return axios
    .get(url + "/utils/branches/all", config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};

export const uploadFileToServer = async (File:File) => {
  const config = getFormDataConfig();
  const formdata = new FormData();
  formdata.append('file', File)
  return axios
    .post(url + "/utils/upload",formdata, config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};

export async function createBranch(branchData: any): Promise<Branch> {
    const token = localStorage.getItem("token"); // Assuming user is logged in
    try {
        const response = await axios.post(
            `${url}/utils/create-branch`,
            branchData,
            {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
            }
        );
        const result = response.data;

        if (!response.status || !result.success) {
            throw new Error(result.message || "Failed to create branch");
        }

        return result.data || "Branch created successfully";
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message || "Failed to create branch");
    }
}

export async function toggleBranch(branchId: string): Promise<boolean> {
    if (branchId === undefined || branchId === null) {
        throw new Error("branchId is required and was not provided.");
    }
    const token = localStorage.getItem("token");
    try {
        const response = await axios.post(
            `${url}/utils/toggle-branch-visibility/${branchId}`,
            { branchId },
            {
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { "Authorization": `Bearer ${token}` }),
                },
            }
        );
        const result = response.data;

        if (!response.status || !result.success) {
            throw new Error(result?.errors?.message || result?.message || "Failed to create branch");
        }

        return result.data?.isActive;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message || "Failed to create branch");
    }
}

export const getActiveBranch = async () => {
  const config = getConfig();
  return axios
    .get(url + "/utils/branches/active", config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};

export const updateBranch = async (branchId:string, branchData: any) => {
  const config = getConfig();
  return axios
    .patch(url+`/utils/update-branch/${branchId}`, branchData, config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};
