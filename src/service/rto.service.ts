import axios from "axios";
import { getConfig,url} from "@/service/auth.service";

export const getAllRto = async () => {
  const config = getConfig();
  return axios
    .get(url + "/utils/rto/all", config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    }); 
};
export const getActiveRto = async () => {
  const config = getConfig();
  return axios
    .get(url + "/utils/rto/all", config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    }); 
};
export const toggleRto = async ( id:string) => {
  const config = getConfig();
  const data = {}

  return axios
    .post(`${url}/utils/rto/toggle-visibility/${id}`, data , config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};

export const createRto = async (rtoCode:string,city:string) => {
  const config = getConfig();
  const data = {rtoCode,city}

  return axios
    .post(`${url}/utils/rto/create`, data , config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};

export const updateRto = async (id:string,rtoCode:string,city:string) => {
  const config = getConfig();
  const data = {rtoCode,city}

  return axios
    .post(`${url}/utils/rto/update/${id}`, data , config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};