import axios from "axios";
import { url, getConfig } from "@/service/auth.service";

export const getBills = async (id:any) => {
  const config = getConfig();
  return axios
    .get(`${url}/bill/client/${id}`, config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};

export const makebillPayment = async (data:any) => {
  const config = getConfig();
  const parsedData = {
    mode: data?.mode,
    paymentProofURL: data?.paymentProofUrl
  }
  return axios
    .post(`${url}/bill/make-bill-payment/${data?.billId}`,parsedData, config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};

export const billbyId = async (id:any) => {
  const config = getConfig();
  return axios
    .get(`${url}/bill/get/${id}`, config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};