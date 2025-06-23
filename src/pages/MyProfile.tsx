import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { useAuth } from "@/context/AuthContext";
import { changePassword } from "@/service/auth.service";
import { useLoading } from "@/components/LoadingContext";
import { useToast } from "@/context/ToastContext";
// import { Progress } from "@/components/ui/progress";


export interface PasswordFormInputs {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

const MyProfile: React.FC = () => {
    const { setLoading } = useLoading();
    const [showDialog, setShowDialog] = useState(false);
    // const [message, setMessage] = useState("");
    const {
        register,
        handleSubmit,
        reset,
        watch,
        formState: { errors },
    } = useForm<PasswordFormInputs>();
    const { user } = useAuth();
    // const creditLimit = 100000;
    // const utilizedLimit = 45000;

    const toast = useToast();
    const newPassword = watch("newPassword");

    const onSubmit = (data: PasswordFormInputs) => {
        if (data.newPassword !== data.confirmPassword) {
            toast.showToast('Error:', 'Passwords do not match!!', 'error')
            return;
        }
        setLoading(true);
        changePassword(data.currentPassword, data.newPassword).then(
            (resp) =>
                toast.showToast('Success', resp?.message, 'success')
        ).finally(() => {
            reset();
            setLoading(false);
            setShowDialog(false);
        })
    };

    const utilized = Number(user?.utilizedCredit) || 0;
    const limit = Number(user?.creditLimit) || 1; // avoid divide-by-zero

    const percentage = (utilized / limit) * 100;

    const getProgressColor = (value: number) => {
        if (value >= 100) return "bg-red-500";
        if (value >= 80) return "bg-orange-500";
        return "bg-green-500";
    };
   return (
  <SidebarProvider>
    <AppSidebar />
    <SidebarTrigger />
    <div className="flex flex-col w-full bg-white pr-6 lg:py-20 h-full min-h-[100vh] ms-3">
      <div className="flex flex-col px-4">
        <Card className="p-6 space-y-6 max-w-5xl w-full mx-auto">
          <h2 className="text-xl font-semibold">My Profile</h2>

          {/* Avatar + Details + Credit Summary */}
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar & Info */}
            <div className="flex gap-4 flex-1 items-center">
              <div className="h-16 w-16 md:h-24 md:w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-xl font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div className="space-y-1">
                <p><strong>Name:</strong> {user?.name}</p>
                <p><strong>Email:</strong> {user?.email}</p>
                <p><strong>Role:</strong> {user?.role}</p>
              </div>
            </div>

            {/* Credit Summary (if client) */}
            {user?.role === "client" && (
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Credit Summary</h3>
                <div className="flex justify-between text-sm font-medium">
                  <span>Utilized: ₹{user.utilizedCredit}</span>
                  <span>Total Limit: ₹{user.creditLimit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mt-2">
                  <div
                    className={`h-full ${getProgressColor(percentage)} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="mt-1 text-right text-xs text-muted-foreground">
                  {(utilized / limit * 100).toFixed(1)}% utilized
                </div>
              </div>
            )}
          </div>

          {/* Change Password Button & Dialog */}
          <div className="flex justify-center">
            <Button
              style={{ cursor: "pointer" }}
              variant="default"
              className="w-full max-w-xs"
              onClick={() => setShowDialog(true)}
            >
              Change Password
            </Button>
          </div>

          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent className="sm:max-w-[400px] rounded-lg shadow-lg">
              <DialogHeader>
                <DialogTitle className="text-center text-lg font-bold">
                  Change Password
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {["currentPassword", "newPassword", "confirmPassword"].map((field) => (
                  <div key={field}>
                    <Label htmlFor={field} className="mb-1 block capitalize">
                      {field.replace(/([A-Z])/g, " $1")}
                    </Label>
                    <Input
                      id={field}
                      type="password"
                      autoComplete="new-password"
                      className="w-full"
                      {...register("newPassword", {
                        required: `${field.replace(/([A-Z])/g, " $1")} is required`,
                        ...(field === "confirmPassword"
                          ? {
                              validate: (value) =>
                                value === newPassword || "Passwords do not match",
                            }
                          : {}),
                      })}
                    />
                    {errors.newPassword && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.newPassword?.message}
                      </p>
                    )}
                  </div>
                ))}
                <DialogFooter className="flex justify-between gap-2 pt-2">
                  <Button
                    style={{ cursor: "pointer" }}
                    type="button"
                    variant="outline"
                    className="w-1/2"
                    onClick={() => setShowDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button style={{ cursor: "pointer" }} type="submit" className="w-1/2">
                    Submit
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </Card>
      </div>
    </div>
  </SidebarProvider>
);

};

export default MyProfile;
