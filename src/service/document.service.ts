import axios from "axios";
import { url, getConfig } from "@/service/auth.service";

export const getDocuments = async () => {
  const config = getConfig();
  return axios
    .get(url + "/document/all", config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during fetch", error);
      throw error;
    });
};

export const updateDocument = async (id: string, data: { name: string; url: string }) => {
  const config = getConfig();
  return axios
    .put(`${url}/document/edit/${id}`, data, config)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error updating document", error);
      throw error;
    });
};

export const deleteDocument = async (id: string) => {
  const config = getConfig();
  return axios
    .delete(`${url}/document/delete/${id}`, config)
    .then((response) => response.data)
    .catch((error) => {
      console.error("Error deleting document", error);
      throw error;
    });
};


export const addDocument = async (documentData: any): Promise<any> => {
  const config = getConfig();
  return axios
    .post(url + "/document/create", documentData, config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during document addition:", error);
      throw error;
    });
}