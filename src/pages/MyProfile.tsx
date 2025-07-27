import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { changePassword, getProfile } from "@/service/auth.service";
import { useLoading } from "@/components/LoadingContext";
import { useToast } from "@/context/ToastContext";
import { Pencil } from "lucide-react";
import { getUpi, updateUpi } from "@/service/bills.service";
import { getDocuments } from "@/service/document.service";

// import { url } from "react-router-dom";
// import { Progress } from "@/components/ui/progress";


type DocumentFormInputs = {
  name: string;
  url: string;
};

export interface PasswordFormInputs {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const MyProfile: React.FC = () => {
  const { setLoading } = useLoading();

  const [showDialog, setShowDialog] = useState(false);

  const [upiId, setUpiId] = useState<string>("");
  const [isEditingUpi, setIsEditingUpi] = useState<boolean>(false);


  // const [message, setMessage] = useState("");
  const {
    control: passwordControl,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    watch,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormInputs>();



  const { user, logout } = useAuth();
  // const creditLimit = 100000;
  // const utilizedLimit = 45000;

  const [person, setPerson] = useState<any>();
  const toast = useToast();
  const [documents, setDocuments] = useState<DocumentFormInputs[]>([]);


  useEffect(() => {
    setLoading(true);
    getProfile().then((resp) => {
      setPerson(resp?.data);
    }).catch((err) => {
      if (err?.status == '401' || err?.response?.status == '401') {
        toast.showToast('Error', 'Session Expired', 'error');
        logout();
      }
      toast.showToast('Error', err?.message || 'Error fetching personal Data', 'error')
    }).finally(() => {
      setTimeout(() => setLoading(false), 3000)
      setLoading(false);
    })
  }, [])

  useEffect(() => {
    if (user?.role !== 'superadmin') return;

    setLoading(true);
    getUpi().then((resp) => {
      setUpiId(resp?.data?.upi);
    }).catch((err: any) => {
      if (err?.status == '401' || err?.response?.status == '401') {
        toast.showToast('Error', 'Session Expired', 'error');
        logout();
      }
      toast.showToast('Error', err?.message || 'Error fetching UPI Id', 'error')
    }).finally(() => {
      setLoading(false);
    })

  }, []);

  const updateUpiId = async (newUpi: string) => {
    try {
      setLoading(true);
      // replace this with your actual update API call
      await updateUpi(newUpi);
      toast.showToast("Success", "UPI ID updated successfully", "success");
      setIsEditingUpi(false);
    } catch (err: any) {
      toast.showToast("Error", err?.message || "Failed to update UPI ID", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    getDocuments().then((resp) => {
      setDocuments(resp?.data);
    }).catch((err) => {
      if (err?.status == '401' || err?.response?.status == '401') {
        toast.showToast('Error', 'Session Expired', 'error');
        logout();
      }
      toast.showToast('Error', err?.message || 'Error fetching personal Data', 'error')
    }).finally(() => {
      setTimeout(() => setLoading(false), 3000)
      setLoading(false);
    })
  }, [])


  const onSubmit = (data: PasswordFormInputs) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.showToast('Error:', 'Passwords do not match!!', 'error')
      return;
    }
    setLoading(true);
    changePassword(data.currentPassword, data.newPassword).then(
      (resp) =>
        toast.showToast('Success', resp?.message, 'success')
    ).catch((err: any) => {
      if (err?.status == '401' || err?.response?.status == '401') {
        toast.showToast('Error', 'Session Expired', 'error');
        logout();
      }
      toast.showToast('Success', err?.message ?? 'Something went wrong', 'success')
    })
      .finally(() => {
        resetPassword();
        setLoading(false);
        setShowDialog(false);
      })
  };

  // Calculate utilized and limit from the latest person object (client nested)
  const utilized = Number(person?.client?.utilizedCredit) || 0;
  const limit = Number(person?.client?.creditLimit) || 1; // avoid divide-by-zero

  const percentage = (utilized / limit) * 100;

  const getProgressColor = (value: number) => {
    // console.log(value);
    if (value >= 100) return "bg-red-500";
    if (value >= 80) return "bg-orange-500";
    return "bg-green-500";
  };




  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <div className="flex flex-col w-full bg-white lg:pr-6 lg:py-20 h-full min-h-[100vh]">
        <div className="flex flex-col px-4">
          <Card className="p-6 space-y-6 max-w-5xl w-full mx-auto">
            <h2 className="text-xl font-semibold">My Profile</h2>

            {/* Avatar + Details + Credit Summary */}
            <div className="flex flex-col md:flex-row gap-6">
              {/* Avatar & Info */}
              <div className="flex gap-4 flex-1 items-center">
                <div className="h-16 w-16 md:h-24 md:w-24 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 md:text-4xl text-2xl font-bold">
                  {person?.firstName?.[0].toUpperCase() ?? ''}{person?.lastName?.[0].toUpperCase() ?? ''}
                </div>
                <div className="space-y-1">
                  <p><strong>Name:</strong> {person?.firstName} {person?.lastName}</p>
                  <p><strong>Email:</strong> {person?.email}</p>
                  <p><strong>Role:</strong> {person?.role}</p>
                </div>
              </div>

              {/* Credit Summary (if client) */}
              {user?.role === "client" && (
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">Credit Summary</h3>
                  <div className="flex justify-between text-sm font-medium">
                    <span>Utilized: ₹{person?.client?.utilizedCredit}</span>
                    <span>Total Limit: ₹{person?.client?.creditLimit}</span>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {(utilized / limit * 100).toFixed(1)}% utilized
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden mt-2">
                    <div
                      className={`h-full ${getProgressColor(percentage)} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {user?.role === "client" && (
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded mb-4 mt-2 text-sm text-yellow-800">
                <strong>NOTE:</strong> Billing date is the last date of the month and the due date of the bill is the 15th of the following month.
              </div>
            )}

            {user?.role === 'superadmin' && (<div className="flex items-center justify-between border px-3 py-2 rounded-md">
              {!isEditingUpi ? (
                <>
                  <span className="text-sm">
                    <strong>UPI ID:</strong> {upiId || "Not Provided"}
                  </span>
                  <button
                    className="text-blue-500 hover:text-blue-700"
                    onClick={() => setIsEditingUpi(true)}
                  >
                    <Pencil className="h-4 w-4 cursor-pointer" />
                  </button>
                </>
              ) : (
                <div className="flex items-center w-full gap-2">
                  <Input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="Enter UPI ID"
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      const isValidUpi = /^[\w.\-]{2,256}@[a-zA-Z]{2,64}$/.test(upiId);
                      if (!isValidUpi) {
                        toast.showToast("Error", "Invalid UPI ID format", "error");
                        return;
                      }
                      updateUpiId(upiId);
                    }}
                    className="px-3"
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsEditingUpi(false);
                      setUpiId(upiId ?? "");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              )}
            </div>)}



            {/* Change Password Button & Dialog */}
            <div className="flex">
              <Button
                style={{ cursor: "pointer" }}
                variant="default"
                className="w-fit max-w-xs justify-end"
                onClick={() => setShowDialog(true)}
              >
                Change Password
              </Button>
            </div>

            {/* Equidistant Buttons Section */}
            {(documents && user?.role !== "client") && (
              <div className="mt-6">
                {documents.length === 0 ? (
                  <p className="text-sm text-gray-500">No documents available</p>
                ) : (
                  <span className="font-semibold text-gray-700 block mb-2">
                    Download Forms:
                  </span>)}
                <div className="flex flex-wrap gap-3">
                  {documents.map((doc: DocumentFormInputs, idx: number) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="min-w-[120px] whitespace-nowrap shadow-sm cursor-pointer"
                      onClick={() => window.open(doc.url, "_blank")}
                    >
                      {doc.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            <Dialog open={showDialog} onOpenChange={setShowDialog}>
              <DialogContent className="sm:max-w-[400px] rounded-lg shadow-lg">
                <DialogHeader>
                  <DialogTitle className="text-center text-lg font-bold">
                    Change Password
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePasswordSubmit(onSubmit)} className="space-y-5">
                  <Controller
                    name="currentPassword"
                    control={passwordControl}
                    rules={{
                      required: "Current Password is required",
                    }}
                    render={({ field }) => (
                      <div>
                        <Label htmlFor="currentPassword" className="mb-1 block">
                          Current Password
                        </Label>
                        <Input
                          {...field}
                          id="currentPassword"
                          type="password"
                          autoComplete="current-password"
                          className="w-full"
                        />
                        {passwordErrors.currentPassword && (
                          <p className="text-xs text-red-500 mt-1">
                            {passwordErrors.currentPassword.message}
                          </p>
                        )}
                      </div>
                    )}
                  />

                  <Controller
                    name="newPassword"
                    control={passwordControl}
                    rules={{
                      required: "New Password is required",
                      minLength: {
                        value: 8,
                        message: "New Password must be at least 8 characters",
                      },
                    }}
                    render={({ field }) => (
                      <div>
                        <Label htmlFor="newPassword" className="mb-1 block">
                          New Password
                        </Label>
                        <Input
                          {...field}
                          id="newPassword"
                          type="password"
                          autoComplete="new-password"
                          className="w-full"
                        />
                        {passwordErrors.newPassword && (
                          <p className="text-xs text-red-500 mt-1">
                            {passwordErrors.newPassword.message}
                          </p>
                        )}
                      </div>
                    )}
                  />

                  <Controller
                    name="confirmPassword"
                    control={passwordControl}
                    rules={{
                      required: "Confirm Password is required",
                      minLength: {
                        value: 8,
                        message: "Confirm Password must be at least 8 characters",
                      },
                      validate: (value) =>
                        value === watch("newPassword") || "Passwords do not match",
                    }}
                    render={({ field }) => (
                      <div>
                        <Label htmlFor="confirmPassword" className="mb-1 block">
                          Confirm Password
                        </Label>
                        <Input
                          {...field}
                          id="confirmPassword"
                          type="password"
                          autoComplete="new-password"
                          className="w-full"
                        />
                        {passwordErrors.confirmPassword && (
                          <p className="text-xs text-red-500 mt-1">
                            {passwordErrors.confirmPassword.message}
                          </p>
                        )}
                      </div>
                    )}
                  />

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






          {(user?.role === "client" || user?.role === "employee") &&
            (<footer className="w-full mt-50 py-4 px-2 bg-gray-100 border-t text-center text-xs md:text-sm flex flex-col md:flex-row items-center justify-center gap-2">
              <span>
                <strong>Customer Care:</strong> 7801878800
              </span>
              <span className="hidden md:inline mx-2">|</span>
              <span>
                <strong>Mail:</strong> info@vahaanrecord.com
              </span>
              <span className="hidden md:inline mx-2">|</span>
              <span>
                Contact us For any Query or help
              </span>
            </footer>)}
        </div>
      </div>
    </SidebarProvider>
  );

};

export default MyProfile;
