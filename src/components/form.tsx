import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { createBranch, toggleBranch } from "@/lib/branch";

interface Branch {
  id: number;
  name: string;
  address1: string;
  address2: string;
  city: string;
  state: string;
  pincode: string;
  isActive: boolean;
}

export default function AdminBranchForm() {
  const [formData, setFormData] = useState<Omit<Branch, "id" | "isActive">>({
    name: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [branches, setBranches] = useState<Branch[]>([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const newBranch = await createBranch(formData);
      if (typeof newBranch === "string") {
        setError(newBranch);
      } else {
        setBranches([...branches, newBranch]);
        setFormData({
          name: "",
          address1: "",
          address2: "",
          city: "",
          state: "",
          pincode: "",
        });
        setMessage("Branch created successfully");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleToggle = async (branchId: number, index: number) => {
    const previous = branches[index].isActive;

    try {

      const newStatus = await toggleBranch(branchId);
      const updated = [...branches];
      updated[index].isActive = newStatus;
      setBranches(updated);
    } catch (err: any) {
      setError(`Failed to toggle status: ${err.message}`);
      // Optional: revert UI to previous state or show toast
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        {["name", "address1", "address2", "city", "state", "pincode"].map((field) => (
          <Input
            key={field}
            name={field}
            placeholder={field[0].toUpperCase() + field.slice(1)}
            value={formData[field as keyof typeof formData]}
            onChange={handleChange}
            required
          />
        ))}
        <Button type="submit">Add Branch</Button>
        {message && <p className="text-green-600 text-sm">{message}</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>

      <table className="w-full text-sm text-left border">
        <thead>
          <tr className="bg-gray-100">
            <th>Name</th>
            <th>Address</th>
            <th>Pincode</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {branches.map((branch, index) => (
            <tr key={branch.id} className="border-t">
              <td>{branch.name}</td>
              <td>{`${branch.address1}, ${branch.address2}, ${branch.city}, ${branch.state}`}</td>
              <td>{branch.pincode}</td>
              <td>
                <Switch
                  checked={branch.isActive}
                  onCheckedChange={() => handleToggle(branch.id, index)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
