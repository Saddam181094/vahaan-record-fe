import axios from "axios";
import { getConfig,url} from "@/service/auth.service";
// import type { Task } from "@/pages/ToDoPage";

export const getTasks = async () => {
  const config = getConfig();
  return axios
    .get(url + "/task/get-all", config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};
export const markDone= async (id:string) => {
  const config = getConfig();
  return axios
    .get (`${url}/task/mark-as-done/${id}`, config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};

export const createTask = async (data:any) => {
  const config = getConfig();
  return axios
    .post(url + "/task/create",data, config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};

export const updateTask = async (Id: any, task_title: string, task_text:string) => {
  const config = getConfig();
  const data = {task_title,task_text}

  return axios.patch(`${url}/task/update/${Id}`, data, config)
    .then((resp) => {
      return resp.data;
    })
    .catch((error) => {
      console.error("Error occurred during patch:", error);
      throw error;
    });
}