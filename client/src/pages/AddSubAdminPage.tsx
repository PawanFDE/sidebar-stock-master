import { useState } from "react";
import {
  useAddSubAdmin,
  useSubAdmins,
  useDeleteSubAdmin,
} from "@/controllers/useAuth";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Trash2, Loader2 } from "lucide-react";

export function AddSubAdminPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { toast } = useToast();

  const addSubAdminMutation = useAddSubAdmin();
  const { data: subAdmins, isLoading, isError, error } = useSubAdmins();
  const deleteSubAdminMutation = useDeleteSubAdmin();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      toast({
        title: "Missing information",
        description: "Both fields are required to create a sub‑admin.",
        variant: "destructive",
      });
      return;
    }

    try {
      await addSubAdminMutation.mutateAsync({ username, password });
      setUsername("");
      setPassword("");
      setIsModalOpen(false);
      toast({
        title: "Success 🎉",
        description: `${username} has been added as a sub‑admin.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to add sub‑admin.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSubAdminMutation.mutateAsync(id);
      toast({
        title: "Deleted",
        description: "Sub‑admin removed successfully.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to delete sub‑admin.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">

        <div>
          <h1 className="text-3xl font-bold text-foreground">Sub‑Admin Management</h1>
          <p className="text-muted-foreground mt-1">
            Create, review, and manage team access efficiently.
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="inline-flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Add Sub‑Admin
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[420px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">
                New Sub‑Admin
              </DialogTitle>
              <DialogDescription>
                Provide credentials for the new sub‑admin account.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="grid gap-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="e.g. john.doe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full flex items-center justify-center gap-2"
                disabled={addSubAdminMutation.isPending}
              >
                {addSubAdminMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  "Add Sub‑Admin"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>


      {/* Sub-Admin Grid */}
      <main>
        <Card>
          <CardHeader>
            <div>
              <CardTitle className="text-xl font-semibold text-slate-800">
                Existing Sub‑Admins
              </CardTitle>
              <CardDescription>
                Manage current administrative users.
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-[120px] w-full rounded-md" />
                ))}
              </div>
            ) : isError ? (
              <p className="text-destructive">
                Error loading sub‑admins: {error?.message}
              </p>
            ) : subAdmins && subAdmins.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {subAdmins.map((admin: any) => (
                  <Card
                    key={admin._id}
                    className="relative hover:shadow-md transition duration-150 border-slate-200"
                  >
                    <CardHeader>
                      <CardTitle className="text-lg font-semibold text-slate-800">
                        {admin.username}
                      </CardTitle>
                      <CardDescription className="text-sm text-slate-500">
                        {admin.role || "Sub‑Admin"}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-3 right-3"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-lg">
                              Confirm Deletion
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. The sub‑admin{" "}
                              <span className="font-semibold text-slate-800">
                                {admin.username}
                              </span>{" "}
                              will be permanently removed.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(admin._id)}
                              className="bg-destructive text-white hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">
                No sub‑admins found. Time to add your first one!
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>

  );
  
}
