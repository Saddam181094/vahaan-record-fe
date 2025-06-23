import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { useToast } from "@/context/ToastContext";
import { useLoading } from "@/components/LoadingContext";
import { createTask, getTasks, markDone, updateTask } from "@/service/tasks.service";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { DialogClose, DialogTrigger } from "@radix-ui/react-dialog";
import { Input } from "@/components/ui/input";

export interface Task {
    id: string;
    task_title: string;
    task_text: string;
    createdAt: string;
    updatedAt: string;
}

const AddBranch = () => {
    const { setLoading } = useLoading();
    const toast = useToast();
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

    useEffect(() => {

        setLoading(true);
        getTasks()
            .then((resp) => {
                setTask(resp?.data?.tasks || []);
                // console.log(resp?.data?.tasks);
                setLoading(false);
            })
            .catch((err: any) => {
                toast.showToast('Error', err?.message || 'Error Fetching the Tasks', 'error');
                setLoading(false);
            });

    }, [refreshFlag]);

      const onSubmit: SubmitHandler<Task> = async (data: Task) => {
        setLoading(true);
      if(editTask){
         try {
           const updated = await updateTask(data?.id,data.task_title, data.task_text);
           setTask((prev) =>
             prev.map((t) => (t.id === data.id ? updated : t))
           );
           toast.showToast("Success", "Task updated successfully", "success");
           setDialogOpen(false);
           setRefreshFlag((prev) => !prev); // Trigger a refresh
           reset();
         } catch (err: any) {
           toast.showToast('Error:', err?.message || 'Error updating the Task', 'error');
         } finally {
           setLoading(false);
         }
      }
else{
        try {
          const newTask = await createTask(data);
          setTask([...task, newTask]);
          setDialogOpen(false);
          setRefreshFlag((prev) => !prev); // Trigger a refresh
          toast.showToast('Success', 'Created a New Task', 'success');
          reset(); // Reset the form after successful submission
        } catch (err: any) {
            toast.showToast('Error:',err?.message || 'Error occured while making a new Task','error');
        } finally {
          setLoading(false);
        }
}
      };
        const handleCheckboxChange = (taskId:string) => {
   setLoading(true);
   markDone(taskId).then(()=>{
              toast.showToast('Success', 'Task Completed Successfully!', 'success');
              setLoading(false);
   }).catch((err:any)=>{
toast.showToast('Error:',err?.message || 'Error occured while marking complete Task','error');
   }).finally(()=>{
    setLoading(false);
   })
  };

  const openUpdateDialog = (task:any) => {
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
    

    return (
        <>
            <SidebarProvider>
                <AppSidebar />
                <SidebarTrigger />
                <div className="flex flex-col w-full bg-white pr-6 py-4 min-h-screen">
                    <div className="flex justify-end mb-4">
                        {/* <Button style={{ cursor: "pointer" }} variant="destructive" className="cursor-pointer  hover:bg-red-800" onClick={() => setOpen(true)}>
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
                                    <Button style={{ cursor: "pointer" }} variant="destructive" className="cursor-pointer  hover:bg-red-800" onClick={handleLogout}>
                                        Logout
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog> */}
                    </div>
 <div className="flex flex-col w-full h-full min-h-screen overflow-y-auto">
      <div className="flex flex-row w-full h-[99vh] overflow-hidden">
        <div className="w-full max-w-4xl mx-10 flex flex-col">
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
                  <Button type="button" style={{cursor:"pointer"}} variant="outline" onClick={handleDiagClick}>
                    Cancel
                  </Button>
                  <Button type="submit" style={{cursor:"pointer"}}>
                    {editTask ? "Update Task" : "Create Task"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>

          {task.length > 0 ? (
            <Accordion type="multiple" className="space-y-2">
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
                      <div><strong>Updated:</strong> {new Date(t.updatedAt).toLocaleString()}</div>
                    </div>
                    <Button
                      size="sm"
                      className="mt-3"
                      style={{cursor:"pointer"}}
                      onClick={() => openUpdateDialog(t)}
                    >
                      Update Task
                    </Button>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          size="sm"
                          className="lg:ml-3 mt-3"
                          style={{cursor:"pointer"}}
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
                            <Button variant="outline" style={{cursor:"pointer"}}>
                              Cancel
                            </Button>
                          </DialogClose>
                          <DialogClose asChild>
                            <Button
                              variant="default"
                              style={{cursor:"pointer"}}
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
        </>
    );
};

export default AddBranch;