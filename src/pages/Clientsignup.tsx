import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { indianStates } from "@/components/Branchform";
import { useForm, type SubmitHandler } from "react-hook-form";
import { createClient } from "@/service/client.service";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export interface NewClient {
  id?: string;
  firstName: string;
    lastName: string;
    email: string;
    mobileNo: string;
    firmName: string;
    address1: string;
    address2: string;
    city: string;
    state: string;
    pincode: string;
}

export default function Signup () {

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
      } = useForm<NewClient>({ defaultValues: {} as NewClient });

    const [form, setForm] = useState<NewClient>({
        firstName: "",
        lastName: "",
        email: "",
        mobileNo: "",
        firmName: "",
        address1: "",
        address2: "",
        city: "",
        state: "",
        pincode: "",
    });
    const [client, setClient] = useState<NewClient[]>([]);

      const onsubmit: SubmitHandler<NewClient> = async (data: NewClient) => {
        try {
          const newClient = await createClient(data);
          setClient([...client, newClient]);
          reset();
        } catch (err: any) {
          console.error(err);
        } finally {
        }
      };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

return(
  <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 via-white to-purple-100">
    <Card className="w-full max-w-lg shadow-2xl rounded-2xl border-0 bg-white/80 backdrop-blur-md">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-purple-700 mb-2">Sign Up</CardTitle>
        <p className="text-gray-500 text-base">Create your account to get started</p>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit(onsubmit)}>
          {["firstName", "lastName", "email", "mobileNo", "firmName", "address1", "address2", "city", "state", "pincode"].map((field) => (
            <div key={field}>
              <Label htmlFor={field} className="text-gray-700 font-medium">
                {field[0].toUpperCase() + field.slice(1)}
              </Label>
              {field === "state" ? (
                <Select
                  onValueChange={(value) => setValue("state", value)}
                  defaultValue={watch("state")}
                >
                  <SelectTrigger className="mt-1 bg-white border-gray-300 focus:ring-2 focus:ring-purple-400">
                    <SelectValue placeholder={`Select ${field}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {indianStates.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  {...register(field as keyof NewClient, { required: true })}
                  placeholder={field[0].toUpperCase() + field.slice(1)}
                  className="mt-1 bg-white border-gray-300 focus:ring-2 focus:ring-purple-400"
                />
              )}
              {errors[field as keyof NewClient] && (
                <p className="text-red-600 text-xs mt-1">{field[0].toUpperCase() + field.slice(1)} is required</p>
              )}
            </div>
          ))}

          <Button
            type="submit"
            className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-2 rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all"
          >
            Sign Up
          </Button>
          </form>
      </CardContent>
    </Card>
  </div>
);
}