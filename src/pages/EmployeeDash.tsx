import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { getSummary } from "@/service/case.service";
import { useToast } from "@/context/ToastContext";
import { useLoading } from "@/components/LoadingContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { DialogClose, DialogTrigger } from "@radix-ui/react-dialog";
// import type { Task } from "@"
import { createTask, getTasks, markDone, updateTask } from "@/service/tasks.service";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";
import type { Task } from "./AdminDash";
import { DateInput } from "@/components/ui/date-input";

type ExpiryData = {
  expiryType: string;
  count: number;
  cases: CurrExpiry[];
};

type CurrExpiry = {
  id: string,
  CaseNo: number,
  status: string,
  createdAt: string,
  vehicleDetail: vehicleDetail,
  expireDetail: expireDetail
  ownerDetails: ownerDetails
}
type expireDetail = {
  pucExpiry?: string
  insuranceExpiry?: string,
  fitnessExpiry?: string,
  taxExpiry?: string,
  permitExpiry?: string
}
type vehicleDetail = {
  vehicleNo: string
}

type ownerDetails = {
  buyerName: string;
  buyerPhoneNo: string;
}

const AdminDashboard = () => {
  const [expiryStats, setExpiryStats] = useState<ExpiryData[]>([]);
  const toast = useToast();
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [DialogOpen2, setDialogOpen2] = useState(false);
  const [currExpiries, setcurrExpiries] = useState<ExpiryData>();
  const { setLoading } = useLoading();
  const navigate = useNavigate();
  const {
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<Task>({ defaultValues: {} as Task });

  const [task, setTask] = useState<Task[]>([])
  const [dialogOpen, setDialogOpen] = useState(false);
  const [refreshFlag, setRefreshFlag] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const { logout, user } = useAuth();

  useEffect(() => {
    setLoading(summaryLoading || tasksLoading);
  }, [summaryLoading, tasksLoading, setLoading]);

  useEffect(() => {
    setTasksLoading(true);

    getTasks()
      .then((resp) => {
        setTask(resp?.data?.tasks || []);
      })
      .catch((err) => {
        if (err?.status === '401' || err?.response?.status === 401) {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        } else {
          toast.showToast('Error:', err?.message || 'Some error Occured during fetch', 'error');
        }
      })
      .finally(() => {
        setTasksLoading(false);
      });
  }, [refreshFlag]);

  const onSubmit: SubmitHandler<Task> = async (data: Task) => {
    setLoading(true);
    // Combine date and time into ISO string
    const { priorityDate, priorityTime, ...rest } = data;
    const combinedPriority = new Date(`${priorityDate}T${priorityTime}`).toISOString();
    const updatedData = { ...rest, priority: combinedPriority };

    if (editTask) {
      try {
        const updated = await updateTask(updatedData?.id, updatedData.task_title, updatedData.task_text, updatedData.priority);

        setTask((prev) =>
          prev.map((t) => (t.id === data.id ? updated : t))
        );
        toast.showToast("Success", "Task updated successfully", "success");
        setDialogOpen(false);
        setRefreshFlag((prev) => !prev); // Trigger a refresh
        reset();
      } catch (err: any) {
        if (err?.status == 401 || err?.response?.status == 401) {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }else
{        toast.showToast('Error:', err?.message || 'Error updating the Task', 'error');
}      } finally {
        setEditTask(null);
        setLoading(false);
      }
    }
    else {
      try {
        const newTask = await createTask(updatedData);
        setTask([...task, newTask]);
        setDialogOpen(false);
        setRefreshFlag((prev) => !prev); // Trigger a refresh
        toast.showToast('Success', 'Created a New Task', 'success');
        reset(); // Reset the form after successful submission
      } catch (err: any) {
        if (err?.status == 401 || err?.response?.status == 401) {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }else
{        toast.showToast('Error:', err?.message || 'Error occured while making a new Task', 'error');
}      } finally {
        setLoading(false);
      }
    }
  };
  const handleCheckboxChange = (taskId: string) => {
    setLoading(true);
    markDone(taskId).then(() => {
      toast.showToast('Success', 'Task Completed Successfully!', 'success');
      setLoading(false);
    }).catch((err: any) => {
      if (err?.status == 401 || err?.response?.status == 401) {
        toast.showToast('Error', 'Session Expired', 'error');
        logout();
      }else
{      toast.showToast('Error:', err?.message || 'Error occured while marking complete Task', 'error');
}    }).finally(() => {
      setLoading(false);
    })
  };

  const openUpdateDialog = (task: any) => {
    setEditTask(task);

    // Split ISO string into date and time
    const isoDate = new Date(task.priority);
    const dateStr = isoDate.toISOString().slice(0, 10); // yyyy-mm-dd
    const timeStr = isoDate.toTimeString().slice(0, 5); // HH:MM

    setValue("id", task.id);
    setValue("task_title", task.task_title);
    setValue("task_text", task.task_text);
    setValue("priorityDate", dateStr);
    setValue("priorityTime", timeStr);

    setDialogOpen(true);
  };

  const handleDiagClick = () => {
    setDialogOpen(false);
    reset(); // Reset the form when dialog is closed
  };



  // const handleClick = (data: any) => {
  //   const type = data;
  //   navigate(`/employee/vcases`, { state: { type } });
  // }

    const handleClick = (data: any) => {
    // const type = data;
    // console.log(data);
    setDialogOpen2(true)
    setcurrExpiries(data)
  }

  // Simulate API fetch (replace this with actual API call)
  useEffect(() => {
    setSummaryLoading(true);

    getSummary()
      .then((resp) => {
        setExpiryStats(resp?.data?.data);
      })
      .catch((err) => {
        if (err?.status === '401' || err?.response?.status === 401) {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        } else {
          toast.showToast('Error:', err?.message || 'Summary was not fetched due to some error', 'error');
        }
      })
      .finally(() => {
        setSummaryLoading(false);
      });
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <div className="flex w-full flex-col bg-white  lg:py-20 h-full min-h-[100vh] lg:ms-0">
        <span className="text-xl md:text-2xl ml-5 font-semibold text-gray-800 tracking-wide mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
          Welcome back, <span className="text-indigo-600">{user?.name || "Employee"}!</span>
        </span>
        {/* Expiry Stats Cards Section */}
        <div className="grid md:grid-cols-2 py-5 lg:mr-5 border rounded-lg bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 mb-8 grid-cols-1 w-full h-full min-h-screen overflow-y-auto">
          <div>
            <span className="col-span-full text-4xl font-bold mb-10 block px-3">Summary of the Cases</span>
            <div className="grid grid-cols-2 gap-3 p-3">
              {expiryStats.map((item, index) => {
                const isEven = index % 2 === 0;
                const bgColor = isEven ? 'bg-[#584FF7]' : 'bg-[#1f2c4d]'; // Metallic tones
                const textColor = 'text-white';

                return (
                  <Card
                    key={item.expiryType}
                    className={`shadow-md border-0 ${bgColor} ${textColor} rounded-lg flex flex-col  transition-transform transform hover:scale-[1.02] duration-200`}
                    onClick={() => handleClick(item)}
                    style={{ cursor: "pointer" }}
                  >
                    <CardHeader className="text-lg font-semibold">
                      {item.expiryType}
                    </CardHeader>
                    <CardContent className="text-4xl font-extrabold">
                      {item.count}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

          </div>
          <div className=" mt-8 md:mt-0">
            <span className="col-span-full text-4xl font-bold mb-10 block md:ms-5 px-3">Markdown</span>
            <div className="w-full max-w-4xl px-3 md:ps-8 flex flex-col">
              <Button
                style={{ cursor: "pointer" }}
                onClick={() => setDialogOpen(true)}
                className="mb-4  bg-[#5156DB] self-start bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white font-semibold shadow-lg rounded-lg"
              >
                Add Tasks
              </Button>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editTask ? "Update Task" : "Add New Task"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mb-6">
                    {/* Hidden input for Task ID (for update mode) */}
                    {editTask && (
                      <Controller
                        name="id"
                        control={control}
                        render={({ field }) => (
                          <Input type="hidden" {...field} />
                        )}
                      />
                    )}
                    <div>
                      <label className="block mb-1 font-medium">Task Title</label>
                      <Controller
                        name="task_title"
                        control={control}
                        rules={{ required: "Task title is required" }}
                        render={({ field }) => (
                          <input
                            {...field}
                            placeholder="Enter task title"
                            className="w-full border rounded px-3 py-2"
                          />
                        )}
                      />
                      {errors.task_title && (
                        <p className="text-red-600 text-sm">{errors.task_title.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Task Description</label>
                      <Controller
                        name="task_text"
                        control={control}
                        rules={{ required: "Task description is required" }}
                        render={({ field }) => (
                          <textarea
                            {...field}
                            placeholder="Enter task description"
                            className="w-full border rounded px-3 py-2"
                            rows={4}
                          />
                        )}
                      />
                      {errors.task_text && (
                        <p className="text-red-600 text-sm">{errors.task_text.message}</p>
                      )}
                    </div>
                    <div>
                      <label className="block mb-1 font-medium">Priority Date</label>
                      <Controller
                        name="priorityDate"
                        control={control}
                        rules={{ required: "Date is required" }}
                        render={({ field }) => (
                          <DateInput
                            id="priorityDate"
                            {...field}
                            className="w-full border rounded px-3 py-2"
                          />
                        )}
                      />
                      {errors.priorityDate && (
                        <p className="text-red-600 text-sm">{errors.priorityDate.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block mb-1 font-medium">Priority Time</label>
                      <Controller
                        name="priorityTime"
                        control={control}
                        rules={{ required: "Time is required" }}
                        render={({ field }) => (
                          <input
                            {...field}
                            type="time"
                            className="w-full border rounded px-3 py-2"
                          />
                        )}
                      />
                      {errors.priorityTime && (
                        <p className="text-red-600 text-sm">{errors.priorityTime.message}</p>
                      )}
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button type="button" style={{ cursor: "pointer" }} variant="outline" onClick={handleDiagClick}>
                        Cancel
                      </Button>
                      <Button type="submit" style={{ cursor: "pointer" }}>
                        {editTask ? "Update Task" : "Create Task"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

                            <Dialog open={DialogOpen2} onOpenChange={setDialogOpen2}>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>{currExpiries?.expiryType} EXPIRIES IN THIS MONTH</DialogTitle>
                                </DialogHeader>
              
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>Case No</TableHead>
                                      <TableHead>Vehicle No</TableHead>
                                      <TableHead>Expiry date</TableHead>
                                      <TableHead>Owner Name</TableHead>
                                      <TableHead>Owner Contact</TableHead>
                                      <TableHead>Action</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {currExpiries?.cases?.map((c, idx) => (
                                      <TableRow key={idx}>
                                        <TableCell>{c.CaseNo}</TableCell>
                                        <TableCell>{c.vehicleDetail?.vehicleNo || <span className="text-red-500">N/A</span>}</TableCell>
                                        <TableCell>
                                          {new Date(c.expireDetail?.pucExpiry || c.expireDetail?.insuranceExpiry || c.expireDetail?.fitnessExpiry || c.expireDetail?.taxExpiry || c.expireDetail?.permitExpiry || '').toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>{c.ownerDetails?.buyerName || <span className="text-red-500">N/A</span>}</TableCell>
                                        <TableCell>{c.ownerDetails?.buyerPhoneNo || <span className="text-red-500">N/A</span>}</TableCell>
                                        <TableCell>
                                          <Button variant={'outline'}
                                            className=" cursor-pointer"
                                            onClick={() => navigate(`/employee/cases/${c.CaseNo}`, { state: { id: c.id } })}
                                          >
                                            View Details
                                          </Button>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </DialogContent>
                            </Dialog>

              {task.length > 0 ? (
                <Accordion
                  type="multiple"
                  className="space-y-3 w-full md:w-[28rem] bg-white rounded-xl shadow p-4"
                >
                  {task.map((t) => (
                    <AccordionItem key={t.id} value={t.id}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-base">{t.task_title}</div>
                          <div
                            className={`text-xs mt-2 ${(() => {
                                const priority = t.priority;
                                if (!priority) return "";
                                const dateObj = new Date(priority);
                                const now = new Date();
                                return dateObj < now ? "text-red-600" : "text-green-600";
                              })()
                              }`}
                          >
                            <strong>Deadline:</strong>{" "}
                            {(() => {
                              const priority = t.priority;
                              if (!priority) return <span>N/A</span>;
                              const dateObj = new Date(priority);
                              const now = new Date();
                              const diffMs = dateObj.getTime() - now.getTime();
                              const absDiffMs = Math.abs(diffMs);
                              const diffDays = Math.floor(absDiffMs / (1000 * 60 * 60 * 24));
                              const diffHours = Math.floor((absDiffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                              const diffMinutes = Math.floor((absDiffMs % (1000 * 60 * 60)) / (1000 * 60));
                              const diffSeconds = Math.floor((absDiffMs % (1000 * 60)) / 1000);

                              let timeStr = "";
                              if (diffDays > 0) {
                                timeStr += `${diffDays} day${diffDays !== 1 ? "s" : ""} `;
                              } else {
                                if (diffHours > 0) timeStr += `${diffHours} hr${diffHours !== 1 ? "s" : ""} `;
                                if (diffMinutes > 0) timeStr += `${diffMinutes} min${diffMinutes !== 1 ? "s" : ""} `;
                                if (diffHours === 0 && diffMinutes === 0)
                                  timeStr += `${diffSeconds} sec${diffSeconds !== 1 ? "s" : ""} `;
                              }

                              if (diffMs < 0) {
                                return (
                                  <span>
                                    ({timeStr.trim()} ago)
                                  </span>
                                );
                              } else if (diffDays === 0 && diffHours === 0 && diffMinutes === 0) {
                                return <span>(Now)</span>;
                              } else {
                                return (
                                  <span>
                                    (in {timeStr.trim()})
                                  </span>
                                );
                              }
                            })()}
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm mb-2">{t.task_text}</p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div>
                            <strong>Updated:</strong>{" "}
                            {(() => {
                              const updatedDate = new Date(t.updatedAt);
                              const now = new Date();
                              const diffMs = now.getTime() - updatedDate.getTime();

                              const seconds = Math.floor(diffMs / 1000);
                              const minutes = Math.floor(seconds / 60);
                              const hours = Math.floor(minutes / 60);
                              const days = Math.floor(hours / 24);

                              if (days >= 1) return updatedDate.toLocaleDateString();
                              if (hours >= 1) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
                              if (minutes >= 1) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
                              return `${seconds} ${seconds !== 1 ? "s" : ""} ago`;
                            })()}

                          </div>
                          <div className="text-xs text-gray-500 mt-2">
                            <strong>Deadline:</strong>{" "}
                            {(() => {
                              const priority = t.priority;
                              if (!priority) return <span>N/A</span>;
                              const dateObj = new Date(priority);
                              return (
                                <>
                                  <span>{dateObj.toLocaleDateString()}</span>, <span> </span><span> </span>
                                  <span>{dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          className="mt-3 me-3"
                          style={{ cursor: "pointer" }}
                          onClick={() => openUpdateDialog(t)}
                        >
                          Update Task
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              className="lg:ml-3 mt-3"
                              style={{ cursor: "pointer" }}
                            >
                              Check Task Done
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirm Task Completion</DialogTitle>
                              <DialogDescription>
                                Are you sure you want to mark this task as done?
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end gap-2">
                              <DialogClose asChild>
                                <Button variant="outline" style={{ cursor: "pointer" }}>
                                  Cancel
                                </Button>
                              </DialogClose>
                              <DialogClose asChild>
                                <Button
                                  variant="default"
                                  style={{ cursor: "pointer" }}
                                  onClick={() => handleCheckboxChange(t.id)}
                                >
                                  Yes, Mark as Done
                                </Button>
                              </DialogClose>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              ) : (
                <p className="text-center text-muted-foreground">No tasks found.</p>
              )}
            </div>
          </div>

        </div>

      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;
