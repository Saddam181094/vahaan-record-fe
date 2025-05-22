// src/lib/branch.ts

const API_BASE_URL = import.meta.env.VITE_API_URL;

export async function createBranch(branchData: any): Promise<string> {
  const token = localStorage.getItem("token"); // Assuming user is logged in
  const response = await fetch(`${API_BASE_URL}/utils/create-branch`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`,
    },
    body: JSON.stringify(branchData),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Failed to create branch");
  }

  return result.data || "Branch created successfully";
}


export async function toggleBranch(branchId: number): Promise<boolean> {
  if (branchId === undefined || branchId === null) {
    throw new Error("branchId is required and was not provided.");
  }
  const token = localStorage.getItem("token");
  const response = await fetch(`${API_BASE_URL}/utils/toggle-branch-visibility/${branchId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token && {"Authorization": `Bearer ${token}`}),
    },
    body: JSON.stringify({ branchId }),
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result?.errors?.message ||result?.message || "Failed to create branch");
  }

  return result.data?.isActive;
}