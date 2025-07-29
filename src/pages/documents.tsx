import { SidebarTrigger, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { addDocument, deleteDocument, getDocuments, updateDocument } from "@/service/document.service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useLoading } from "@/components/LoadingContext";
import { useToast } from "@/context/ToastContext";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
type DocumentFormInputs = {
  name: string;
  url: string;
};


const AddFirm = () => {
  const toast = useToast();
  const { setLoading } = useLoading();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoadingDoc] = useState(false); // Loading state for document add
  const { user, logout } = useAuth();
  // State for editing document
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedLink, setEditedLink] = useState<string>("");
  const [editedName, setEditedName] = useState("");
  const {
    control: docControl,
    handleSubmit: handleDocSubmit,
    reset: resetDoc,
    formState: { errors: docErrors },
  } = useForm<DocumentFormInputs>({
    defaultValues: {
      name: "",
      url: "",
    },
  });

  useEffect(() => {
    setLoading(true);
    getDocuments().then((resp) => {
      setDocuments(resp?.data);
    }).catch((err) => {
      if (err?.status == 401 || err?.response?.status == 401) {
        toast.showToast('Error', 'Session Expired', 'error');
        logout();
      } else {
        toast.showToast('Error:', err?.message || 'Some error Occured during fetch', 'error');
      }
    }).finally(() => {
      setTimeout(() => setLoading(false), 3000)
      setLoading(false);
    })
  }, [])

  const handleAddDocument = (data: DocumentFormInputs) => {
    setLoading(true);
    setLoadingDoc(true);

    addDocument({ name: data.name.trim(), url: data.url.trim() })
      .then((resp) => {
        setDocuments((prev) => [...prev, resp.data]);
        toast.showToast("Success", "Document added", "success");
        setShowAddDialog(false);
        resetDoc(); // Reset form values
      })
      .catch((err: any) => {
        toast.showToast("Error", err?.message || "Failed to add document", "error");
      })
      .finally(() => {
        setLoading(false)
        setLoadingDoc(false);
      });
  };


  const handleEdit = (updatedDoc: DocumentFormInputs & { id: string }) => {
    setLoading(true);
    setEditingId(updatedDoc.id);

    updateDocument(updatedDoc.id, {
      name: updatedDoc.name.trim(),
      url: updatedDoc.url.trim(),
    })
      .then((resp) => {
        setDocuments((prev) =>
          prev.map((doc) => (doc.id === updatedDoc.id ? resp.data : doc))
        );
        toast.showToast("Success", "Document updated", "success");
        setShowAddDialog(false);
        resetDoc(); // reset form if you're using useForm for edit
      })
      .catch((err) => {
        toast.showToast("Error", err?.message || "Failed to update document", "error");
      })
      .finally(() => {
        setLoading(false)
        setEditingId(null);
        setEditedLink("");
      });
  };

  const handleDelete = (id: string) => {
    setLoading(true);

    deleteDocument(id)
      .then(() => {
        setDocuments((prev) => prev.filter((doc) => doc.id !== id));
        toast.showToast("Success", "Document deleted", "success");
      })
      .catch((err) => {
        toast.showToast("Error", err?.message || "Failed to delete document", "error");
      })
      .finally(() => setLoading(false));
  };
  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarTrigger />
        <div className="flex flex-col w-full bg-white pr-6 lg:py-20 h-full min-h-[100vh]">
          <div className="flex flex-col w-full h-full min-h-screen ml-3">
            <h2 className="text-lg font-semibold mt-10 mb-4">Important Documents</h2>


            {user?.role === "superadmin" && (
              <div className="space-y-4">
                <div className="flex justify-start pb-8">
                  <Button onClick={() => setShowAddDialog(true)} className="text-white cursor-pointer">
                    + Add Document
                  </Button>
                </div>
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogContent className="sm:max-w-[400px] rounded-lg shadow-lg">
                    <DialogHeader>
                      <DialogTitle className="text-center text-lg font-bold">Add Document</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleDocSubmit(handleAddDocument)} className="space-y-5">
                      <div>
                        <Label htmlFor="docName" className="mb-1 block">Name</Label>
                        <Controller
                          name="name"
                          control={docControl}
                          rules={{ required: "Document name is required" }}
                          render={({ field }) => (
                            <Input
                              id="docName"
                              placeholder="Document Name"
                              {...field}
                              className="w-full"
                            />
                          )}
                        />
                        {docErrors.name && (
                          <p className="text-xs text-red-500 mt-1">{docErrors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="docLink" className="mb-1 block">Form url</Label>
                        <Controller
                          name="url"
                          control={docControl}
                          rules={{
                            required: "Form url is required",
                            pattern: {
                              value: /^https?:\/\/\S+$/i,
                              message: "Enter a valid URL",
                            },
                          }}
                          render={({ field }) => (
                            <Input
                              id="docLink"
                              placeholder="https://example.com/form"
                              {...field}
                              className="w-full"
                            />
                          )}
                        />
                        {docErrors.url && (
                          <p className="text-xs text-red-500 mt-1">{docErrors.url.message}</p>
                        )}
                      </div>

                      <DialogFooter className="flex justify-between gap-2 pt-2">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-1/2"
                          onClick={() => setShowAddDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" className="w-1/2" disabled={loading}>
                          {loading ? "Adding..." : "Add"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            )}



            {documents.length === 0 ? (
              <p className="text-muted-foreground p-10">No documents added.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Form url</TableHead>
                    {user?.role === "superadmin" && (<TableHead className="text-right">Actions</TableHead>)}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => {
                    const isEditing = editingId === doc.id;

                    return (
                      <TableRow key={doc.id}>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editedName}
                              onChange={(e) => setEditedName(e.target.value)}
                              className="w-full"
                            />
                          ) : (
                            doc.name
                          )}
                        </TableCell>
                        <TableCell>
                          {isEditing ? (
                            <Input
                              value={editedLink}
                              onChange={(e) => setEditedLink(e.target.value)}
                              className="w-full"
                            />
                          ) : (
                            <a
                              href={doc.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 font-semibold underline"
                            >
                              LINK
                            </a>
                          )}
                        </TableCell>

                        {user?.role === "superadmin" &&
                          (<TableCell className="text-right space-x-2">
                            {isEditing ? (
                              <>
                                <Button
                                  variant="default"
                                  size="sm"
                                  className="cursor-pointer"
                                  onClick={() =>
                                    handleEdit({ id: doc.id, name: editedName, url: editedLink })
                                  }
                                >
                                  Save
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="cursor-pointer"
                                  onClick={() => {
                                    setEditingId(null);
                                    setEditedLink("");
                                    setEditedName("");
                                  }}
                                >
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <Button
                                variant="outline"
                                size="sm"
                                className="cursor-pointer"
                                onClick={() => {
                                  setEditingId(doc.id);
                                  setEditedLink(doc.url || "");
                                  setEditedName(doc.name || "");
                                }}
                              >
                                Edit
                              </Button>
                            )}

                            {!isEditing && (<Button
                              variant="destructive"
                              size="sm"
                              className="cursor-pointer"
                              onClick={() => handleDelete(doc.id)}
                            >
                              Delete
                            </Button>)}
                          </TableCell>)}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
      </SidebarProvider>
    </>
  );
};

export default AddFirm;