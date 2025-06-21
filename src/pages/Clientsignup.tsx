import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { indianStates } from "@/components/Branchform";
import { useForm, type SubmitHandler } from "react-hook-form";
import { createClient } from "@/service/client.service";
import { Link, useNavigate } from "react-router-dom";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { useLoading } from "@/components/LoadingContext";
import { useToast } from "@/context/ToastContext";

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

    const [client, setClient] = useState<NewClient[]>([]);
    const {setLoading} = useLoading();
    const [search,setSearch] = useState("");
    const toast = useToast();
    const navigate = useNavigate();
    // const [serror, showerror] = useState<String>("");
      const onsubmit: SubmitHandler<NewClient> = async (data: NewClient) => {
        setLoading(true);
        try {
          const newClient = await createClient(data);
          setClient([...client, newClient]);
          toast.showToast('Success:','ID created Successfully','success');
          navigate(-1);
          reset();
        } catch (err: any) {
          // showerror(err);
         toast.showToast('Error:',err?.message || 'Unable to Sign Up due to errors','warning');
          reset();
        } finally {
          setLoading(false);
        }
      };

        const ind2 = indianStates.filter((hostel) =>
              hostel.toLowerCase().includes(search.toLowerCase())
          );

    // const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    //     setForm({ ...form, [e.target.name]: e.target.value });
    // };

return(
  <div className="flex flex-col items-center justify-center min-h-[100vh] bg-gradient-to-br from-blue-100 via-white to-purple-100 ">
    <Card className="w-full lg:max-w-[40%] md:max-w-[98%] shadow-2xl rounded-2xl border-0 bg-white/80 backdrop-blur-md">
      <CardHeader className="text-center">
        <CardTitle className="text-3xl font-bold text-purple-700 mb-2">Sign Up</CardTitle>
        <p className="text-gray-500 text-base">Create your account for Vahaan Record</p>
      </CardHeader>
      <CardContent>
        <form className="space-y-5" onSubmit={handleSubmit(onsubmit)}>
          {/* Row 1: First Name, Last Name */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="firstName" className="text-gray-700 font-medium">First Name</Label>
              <Input
                {...register("firstName", { required: true })}
                placeholder="First Name"
                className="mt-1 bg-white border-gray-300 focus:ring-2 focus:ring-purple-400"
              />
              {errors.firstName && (
                <p className="text-red-600 text-xs mt-1">First Name is required</p>
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="lastName" className="text-gray-700 font-medium">Last Name</Label>
              <Input
                {...register("lastName", { required: true })}
                placeholder="Last Name"
                className="mt-1 bg-white border-gray-300 focus:ring-2 focus:ring-purple-400"
              />
              {errors.lastName && (
                <p className="text-red-600 text-xs mt-1">Last Name is required</p>
              )}
            </div>
          </div>
          {/* Row 2: Email, Mobile No */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
              <Input
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address",
                  },
                })}
                placeholder="Email"
                className="mt-1 bg-white border-gray-300 focus:ring-2 focus:ring-purple-400"
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="mobileNo" className="text-gray-700 font-medium">Mobile No</Label>
              <Input
                {...register("mobileNo", { required: true })}
                placeholder="Mobile No"
                className="mt-1 bg-white border-gray-300 focus:ring-2 focus:ring-purple-400"
              />
              {errors.mobileNo && (
                <p className="text-red-600 text-xs mt-1">Mobile No is required</p>
              )}
            </div>
          </div>
          {/* Row 3: Firm Name */}
          <div>
            <Label htmlFor="firmName" className="text-gray-700 font-medium">Firm Name</Label>
            <Input
              {...register("firmName", { required: true })}
              placeholder="Firm Name"
              className="mt-1 bg-white border-gray-300 focus:ring-2 focus:ring-purple-400"
            />
            {errors.firmName && (
              <p className="text-red-600 text-xs mt-1">Firm Name is required</p>
            )}
          </div>
          {/* Row 4: Address1, Address2 */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="address1" className="text-gray-700 font-medium">Address 1</Label>
              <Input
                {...register("address1", { required: true })}
                placeholder="Address 1"
                className="mt-1 bg-white border-gray-300 focus:ring-2 focus:ring-purple-400"
              />
              {errors.address1 && (
                <p className="text-red-600 text-xs mt-1">Address 1 is required</p>
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="address2" className="text-gray-700 font-medium">Address 2</Label>
              <Input
                {...register("address2", { required: true })}
                placeholder="Address 2"
                className="mt-1 bg-white border-gray-300 focus:ring-2 focus:ring-purple-400"
              />
              {errors.address2 && (
                <p className="text-red-600 text-xs mt-1">Address 2 is required</p>
              )}
            </div>
          </div>
          {/* Row 5: City, State, Pincode */}
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="city" className="text-gray-700 font-medium">City</Label>
              <Input
                {...register("city", { required: true })}
                placeholder="City"
                className="mt-1 bg-white border-gray-300 focus:ring-2 focus:ring-purple-400"
              />
              {errors.city && (
                <p className="text-red-600 text-xs mt-1">City is required</p>
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="state" className="text-gray-700 font-medium">State</Label>
              <Select
                onValueChange={(value) => {setValue("state", value);setSearch('')}}
                defaultValue={watch("state")}
              >
                <SelectTrigger className="mt-1 bg-white border-gray-300 focus:ring-2 focus:ring-purple-400">
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2">
                    <Input
                      placeholder="Search a State"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="mb-2"
                      onClick={(e) => e.stopPropagation()} 
                      onKeyDown={(e) => e.stopPropagation()} 
                    />
                  </div>
                  {ind2.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.state && (
                <p className="text-red-600 text-xs mt-1">State is required</p>
              )}
            </div>
            <div className="flex-1">
              <Label htmlFor="pincode" className="text-gray-700 font-medium">Pincode</Label>
              <Input
                {...register("pincode", { required: true })}
                placeholder="Pincode"
                className="mt-1 bg-white border-gray-300 focus:ring-2 focus:ring-purple-400"
              />
              {errors.pincode && (
                <p className="text-red-600 text-xs mt-1">Pincode is required</p>
              )}
            </div>
          </div>
          <Button
          style={{cursor:"pointer"}}
            type="submit"
            className="w-full mt-6 bg-gradient-to-r cursor-pointer from-blue-500 to-purple-500 text-white font-semibold py-2 rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all"
          >
            Sign Up
          </Button>
        </form>

        <div className="text-center text-sm pt-10">
                Already have an account?{" "}
                <Link to="/" className="underline underline-offset-4 font-bold">
                  Log In
                </Link>
              </div>
      </CardContent>
    </Card>


  </div>
);
}