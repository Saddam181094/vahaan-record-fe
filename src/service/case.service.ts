import axios from "axios";
import { url, getConfig } from "@/service/auth.service";
// import type { FinalDetails } from "@/components/CaseDetailsAdmin";
import type { Case } from "@/components/CaseForm";
// import { type Case } from "@/components/CaseForm";

export const createCase = async (CaseData: any) => {
  const config = getConfig();
  try {
    const response = await axios.post(`${url}/case/new`, CaseData, config);
    const result = response.data;

    if (!result.success) {
      // 🔥 Throw here for backend-level validation failures
      throw new Error(result.message || "Failed to create Case");
    }

    return result;
  } catch (error: any) {
    // 🔥 This will now catch both HTTP and backend validation errors
    throw new Error(error.response?.data?.message || error.message || "Failed to create Case");
  }
};


export const getAllCases = async ( filterType: string,
  fromDate: string,
  toDate: string,) => {
  const config = getConfig();
  const data = {filterType,fromDate,toDate}

  return axios
    .post(url + "/case/all", data,config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};

export const getAllRejectedCases = async ( filterType: string,
  fromDate: string,
  toDate: string,) => {
  const config = getConfig();
  const data = {filterType,fromDate,toDate}

  return axios
    .post(url + "/case/rejected", data,config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};
export const getEmployeeV = async ( filterType: string,
  fromDate: string,
  toDate: string,) => {
  const config = getConfig();
  const data = {filterType,fromDate,toDate}

  return axios
    .post(url + "/case/employee/verified", data,config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};
export const postIds = async (caseAssignmentIds:string[]) => {
  const config = getConfig();
  return axios
    .post(url + "/case/get-payment-details",{caseAssignmentIds}, config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};

export const getAllCasesE = async () => {
  const config = getConfig();
  return axios
    .get(url + "/case/employee", config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};


export const getCasesbyEmployee = async ( filterType: string,
  fromDate: string,
  toDate: string, id:string) => {
  const config = getConfig();
  const data = {filterType,fromDate,toDate}

  return axios
    .post(`${url}/case/employee-detail/${id}`, data , config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};
export const getAdminCases = async () => {
  const config = getConfig();
  return axios
    .get(url + "/case/admin", config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};

export const getSummary = async () => {
  const config = getConfig();
  return axios
    .get(url + "/case/summary", config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};


export const getCaseID = async (Id: any) => {
  const config = getConfig();
  return axios
    .get(`${url}/case/details/${Id}`, config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};

export const getCasebyClient = async (Id: any , filterType: string,
  fromDate: string,
  toDate: string,) => {
  const config = getConfig();
  const data = {filterType,fromDate,toDate};

  return axios
    .post(`${url}/case/client/${Id}`,data, config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};

export const updateCaseID = async (Id: any, data: Case) => {
  const config = getConfig();

  return axios.patch(`${url}/case/edit/${Id}`, data, config)
    .then((resp) => {
      return resp.data;
    })
    .catch((error) => {
      console.error("Error occurred during patch:", error);
      throw error;
    });
}

export const verifyCase = async (Id: any) => {
  const config = getConfig();
  const data = {};

  return axios.patch(`${url}/case/verify/${Id}`, data , config)
    .then((resp) => {
      return resp.data;
    })
    .catch((error) => {
      console.error("Error occurred during patch:", error);
      throw error;
    });
}

export const verifyPayments = async (Id: any) => {
  const config = getConfig();

  return axios.patch(`${url}/case/verify-payment/${Id}`,{}, config)
    .then((resp) => {
      return resp.data;
    })
    .catch((error) => {
      console.error("Error occurred during patch:", error);
      throw error;
    });
}

export const rejectPayment = async (Id: any) => {
  const config = getConfig();

  return axios.patch(`${url}/case/reject-payment/${Id}`,{}, config)
    .then((resp) => {
      return resp.data;
    })
    .catch((error) => {
      console.error("Error occurred during patch:", error);
      throw error;
    });
}


export const assignCase = async (caseId: string, clientId: string) => {
  const config = getConfig();
  const data = {
    caseId,
    clientId
  };
  return axios.post(`${url}/case/assign`, data, config)
    .then((resp) => {
      return resp.data;
    })
    .catch((error) => {
      console.error("Error occurred during post:", error);
      throw error;
    });
}
export const rejectCase = async (caseId: string, rejectionRemarks: string) => {
  const config = getConfig();
  const data = {
    rejectionRemarks
  };
  return axios.post(`${url}/case/reject/${caseId}`, data, config)
    .then((resp) => {
      return resp.data;
    })
    .catch((error) => {
      console.error("Error occurred during post:", error);
      throw error;
    });
}

export const getClientCases = async () => {
  const config = getConfig();
  return axios
    .get(url + "/case/client", config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};

export const getUnPayments = async () => {
  const config = getConfig();
  return axios
    .get(url + "/case/unverified-payments", config)
    .then((response) => {
      return response.data;
    })
    .catch((error) => {
      console.error("Error occurred during login:", error);
      throw error;
    });
};

