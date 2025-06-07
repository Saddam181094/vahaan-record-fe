import type { NewClient } from "@/pages/Clientsignup";
import axios from "axios";
import { url,getConfig } from "@/service/auth.service";

export async function createClient(clientData: any): Promise<NewClient> {
    // const token = localStorage.getItem("token"); // Assuming user is logged in
    try {
        const response = await axios.post(
            `${url}/client/signup`,
            clientData,
            {
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );
        const result = response.data;

        if (!response.status || !result.success) {
            throw new Error(result.message || "Failed to create Client");
        }

        return result.data || "Client created successfully";
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message || "Failed to create Client");
    }
}

export const getClient = async () => {
  const config = getConfig();
  return axios
    .get(url + "/client/all", config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};

export const makePayment = async (data:any) => {
  const config = getConfig();
  return axios
    .post(url + "/client/make-case-payment",data, config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};


export const unVerifiedClients = async () => {
  const config = getConfig();
  return axios
    .get(url + "/client/unverified/all", config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};

export const getActiveClients = async () => {
  const config = getConfig();
  return axios
    .get(url + "/client/active", config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};

export async function verifyClient(clientId: string, creditLimit: number, fixedPenaltyAmount: number): Promise<NewClient> {
    const config = getConfig();
    try {
        const response = await axios.post(
            `${url}/client/verify/${clientId}`,
            {
                creditLimit,
                fixedPenaltyAmount
            },
            config
        );
        const result = response.data;

        if (!response.status || !result.success) {
            throw new Error(result.message || "Failed to verify Client");
        }

        return result.data;
    } catch (error: any) {
        throw new Error(error.response?.data?.message || error.message || "Failed to verify Client");
    }
}