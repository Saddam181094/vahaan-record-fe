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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { DialogClose, DialogTrigger } from "@radix-ui/react-dialog";
import type { Task } from "./ToDoPage";
import { createTask, getTasks, markDone, updateTask } from "@/service/tasks.service";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthContext";

type ExpiryData = {
  expiryType: string;
  count: number;
};

const AdminDashboard = () => {
  const [expiryStats, setExpiryStats] = useState<ExpiryData[]>([]);
  const toast = useToast();
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
  const {logout} = useAuth();

  useEffect(() => {

    setLoading(true);
    getTasks()
      .then((resp) => {
        setTask(resp?.data?.tasks || []);
        // console.log(resp?.data?.tasks);
        setLoading(false);
      })
      .catch((err: any) => {
                if(err?.status == '401' || err?.response?.status == '401')
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
        toast.showToast('Error', err?.message || 'Error Fetching the Tasks', 'error');
        setLoading(false);
      });

  }, [refreshFlag]);

  const onSubmit: SubmitHandler<Task> = async (data: Task) => {
    setLoading(true);
    if (editTask) {
      try {
        const updated = await updateTask(data?.id, data.task_title, data.task_text);
        setTask((prev) =>
          prev.map((t) => (t.id === data.id ? updated : t))
        );
        toast.showToast("Success", "Task updated successfully", "success");
        setDialogOpen(false);
        setRefreshFlag((prev) => !prev); // Trigger a refresh
        reset();
      } catch (err: any) {
                if(err?.status == '401' || err?.response?.status == '401')
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
        toast.showToast('Error:', err?.message || 'Error updating the Task', 'error');
      } finally {
        setLoading(false);
      }
    }
    else {
      try {
        const newTask = await createTask(data);
        setTask([...task, newTask]);
        setDialogOpen(false);
        setRefreshFlag((prev) => !prev); // Trigger a refresh
        toast.showToast('Success', 'Created a New Task', 'success');
        reset(); // Reset the form after successful submission
      } catch (err: any) {
                if(err?.status == '401' || err?.response?.status == '401')
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
        toast.showToast('Error:', err?.message || 'Error occured while making a new Task', 'error');
      } finally {
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
              if(err?.status == '401' || err?.response?.status == '401')
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
      toast.showToast('Error:', err?.message || 'Error occured while marking complete Task', 'error');
    }).finally(() => {
      setLoading(false);
    })
  };

  const openUpdateDialog = (task: any) => {
    setEditTask(task);
    setValue("id", task.id);
    setValue("task_title", task.task_title);
    setValue("task_text", task.task_text);
    setDialogOpen(true);
  };

  const handleDiagClick = () => {
    setDialogOpen(false);
    reset(); // Reset the form when dialog is closed
  };



  const handleClick = (data: any) => {
    const type = data;
    navigate(`/employee/vcases`, { state: { type } });
  }

  // Simulate API fetch (replace this with actual API call)
  useEffect(() => {
    // replace this with your actual API service
    setLoading(true);
    getSummary()
      .then((resp) => {
        setExpiryStats(resp?.data?.data)
      })
      .catch((err) => {
                if(err?.status == '401' || err?.response?.status == '401')
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
        toast.showToast('Error:', err?.message || 'Summary was not fetched due to some error', 'error')
      }).finally(() => {
        setLoading(false);
      })
  }, []);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarTrigger />
      <div className="flex w-full bg-white  lg:py-20 h-full min-h-[100vh] lg:ms-0">

        {/* Expiry Stats Cards Section */}
        <div className="grid md:grid-cols-2 mb-8 grid-cols-1 w-full h-full min-h-screen overflow-y-auto">
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
                    className={`shadow-md border-0 ${bgColor} ${textColor} rounded-lg flex flex-col j`}
                    onClick={() => handleClick(item.expiryType)}
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
                className="mb-4  bg-[#5156DB] self-start"
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

              {task.length > 0 ? (
                <Accordion type="multiple" className="space-y-2 w-96">
                  {task.map((t) => (
                    <AccordionItem key={t.id} value={t.id}>
                      <AccordionTrigger className="text-left">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-base">{t.task_title}</div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-sm mb-2">{t.task_text}</p>
                        <div className="text-xs text-muted-foreground space-y-1">
                          <div><strong>Created:</strong> {new Date(t.createdAt).toLocaleString()}</div>
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
  return `${seconds} second${seconds !== 1 ? "s" : ""} ago`;
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
