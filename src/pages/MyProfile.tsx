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
            <div className="flex flex-col w-full bg-white pr-6 py-4 h-full min-h-[100vh]">
                <div className="flex justify-end mb-4">
                    {/* <Button variant="destructive" className="cursor-pointer  hover:bg-red-800" onClick={() => setOpen(true)}>
                        Logout
                    </Button>
                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Confirm Logout</DialogTitle>
                                <DialogDescription>
                                    Are you sure you want to logout?
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end gap-2">
                                <Button style={{ cursor: "pointer" }} variant="outline" onClick={() => setOpen(false)}>
                                    Cancel
                                </Button>
                                <Button variant="destructive" className="cursor-pointer  hover:bg-red-800" onClick={handleLogout}>
                                    Logout
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog> */}
                </div>

                <div className="flex flex-col md:flex-row justify-between w-full gap-6 px-4">
                    <div className="max-w-md w-full p-6">
                        <Card className="p-4 space-y-4">
                            <h2 className="text-xl font-semibold">My Profile</h2>
                            <div className="flex justify-center gap-10">
                                <div className="flex justify-center">
                                    <div className="lg:h-24 lg:w-24 h-10 w-10 rounded-full bg-gray-200 flex text-gray-500 text-sm">

                                    </div>
                                </div>
                                <div>
                                    <p>
                                        <strong>Name:</strong> {user?.name}
                                    </p>
                                    <p>
                                        <strong>Email:</strong> {user?.email}
                                    </p>
                                    <p>
                                        <strong>Role:</strong> {user?.role}
                                    </p>
                                </div>
                            </div>
                            <div className="mt-6 flex flex-col items-center">
                                <Button
                                    style={{ cursor: "pointer" }}
                                    variant="default"
                                    className="w-full max-w-xs"
                                    onClick={() => setShowDialog(true)}
                                >
                                    Change Password
                                </Button>
                                <Dialog open={showDialog} onOpenChange={setShowDialog}>
                                    <DialogContent className="sm:max-w-[400px] rounded-lg shadow-lg">
                                        <DialogHeader>
                                            <DialogTitle className="text-center text-lg font-bold">
                                                Change Password
                                            </DialogTitle>
                                        </DialogHeader>
                                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                            <div>
                                                <Label htmlFor="currentPassword" className="mb-1 block">
                                                    Current Password
                                                </Label>
                                                <Input
                                                    id="currentPassword"
                                                    type="password"
                                                    autoComplete="current-password"
                                                    className="w-full"
                                                    {...register("currentPassword", {
                                                        required: "Current password is required",
                                                    })}
                                                />
                                                {errors.currentPassword && (
                                                    <p className="text-xs text-red-500 mt-1">
                                                        {errors.currentPassword.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="newPassword" className="mb-1 block">
                                                    New Password
                                                </Label>
                                                <Input
                                                    id="newPassword"
                                                    type="password"
                                                    autoComplete="new-password"
                                                    className="w-full"
                                                    {...register("newPassword", {
                                                        required: "New password is required",
                                                    })}
                                                />
                                                {errors.newPassword && (
                                                    <p className="text-xs text-red-500 mt-1">
                                                        {errors.newPassword.message}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <Label htmlFor="confirmPassword" className="mb-1 block">
                                                    Confirm New Password
                                                </Label>
                                                <Input
                                                    id="confirmPassword"
                                                    type="password"
                                                    autoComplete="new-password"
                                                    className="w-full"
                                                    {...register("confirmPassword", {
                                                        required: "Please confirm your new password",
                                                        validate: (value) =>
                                                            value === newPassword || "Passwords do not match",
                                                    })}
                                                />
                                                {errors.confirmPassword && (
                                                    <p className="text-xs text-red-500 mt-1">
                                                        {errors.confirmPassword.message}
                                                    </p>
                                                )}
                                            </div>
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
                            </div>
                        </Card>
                    </div>
                    {user?.role === 'client' ? (
                        <div className="flex-1 flex items-center justify-end p-6">
                            <Card className="p-6 space-y-2 w-full max-w-xs">
                                <h2 className="text-xl font-semibold">Credit Summary</h2>
                                <div className="flex justify-between text-sm font-medium">
                                    <span>Utilized: ₹{user.utilizedCredit}</span>
                                    <span>Total Limit: ₹{user.creditLimit}</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                    <div
                                        className={`h-full ${getProgressColor(percentage)} transition-all duration-500`}
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <div
                                    className="mt-1 text-right text-xs text-muted-foreground"
                                >
                                    {(utilized / limit * 100).toFixed(1)}% utilized
                                </div>
                            </Card>
                        </div>
                    ) : null}
                </div>
            </div>
        </SidebarProvider>
    );
};

export default MyProfile;
