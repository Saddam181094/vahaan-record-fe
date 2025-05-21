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

  return result.message || "Branch created successfully";
}
