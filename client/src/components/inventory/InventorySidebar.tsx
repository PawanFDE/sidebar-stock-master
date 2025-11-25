// View Component - Sidebar Navigation
import { NavLink } from "@/components/NavLink";
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
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar";
import { useLogout } from "@/controllers/useAuth";
import { useInventoryController } from "@/controllers/useInventoryController";
import {
    Activity,
    ArrowRightLeft,
    Clock,
    FolderOpen,
    LayoutDashboard,
    LogOut,
    Package,
    User,
    UserPlus
} from "lucide-react";

const navigationItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Inventory", url: "/inventory", icon: Package },
  {
    title: "Transferred Items",
    url: "/transferred-items",
    icon: ArrowRightLeft,
  },
  { title: "Categories", url: "/categories", icon: FolderOpen },
  {
    title: "Pending Replacements",
    url: "/pending-replacements",
    icon: Clock,
  },
];

export function InventorySidebar() {
  const { open } = useSidebar();
  const { categories } = useInventoryController();
  const logout = useLogout();

  // Get user info from localStorage to check role
  const userInfoString = localStorage.getItem("userInfo");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const userRole = userInfo?.role;

  // Get initials for avatar
  const getInitials = (username: string) => {
    return username
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U";
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarContent className="flex flex-col h-full">
        {/* Logo/Brand Section */}
        <div className={`px-4 py-6 border-b border-sidebar-border ${!open ? "px-2" : ""}`}>
          <div className="flex items-center gap-3">
            <div className={`flex items-center justify-center rounded-lg ${open ? "w-12 h-12" : "w-8 h-8"} transition-all`}>
              <img src="/logo.png" alt="Logo" className={`object-contain ${open ? "h-10 w-10" : "h-6 w-6"}`} />
            </div>
            {open && (
              <div className="flex flex-col">
                <h2 className="font-bold text-base text-sidebar-foreground leading-tight">
                  Fardar Express
                </h2>
                <p className="text-xs text-muted-foreground">Domestic</p>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Section */}
        <SidebarGroup className="flex-1 py-4">
          <SidebarGroupLabel className="px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2">
            <SidebarMenu className="space-y-1 px-2">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 group"
                      activeClassName="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20 font-medium"
                    >
                      <item.icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                      <span className="text-sm">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {userRole === "superadmin" && (
                <>
                  <div className="my-3 mx-2 border-t border-sidebar-border" />
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to="/audit-logs"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 group"
                        activeClassName="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20 font-medium"
                      >
                        <Activity className="h-5 w-5 transition-transform group-hover:scale-110" />
                        <span className="text-sm">Audit Logs</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to="/add-subadmin"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200 group"
                        activeClassName="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/20 font-medium"
                      >
                        <UserPlus className="h-5 w-5 transition-transform group-hover:scale-110" />
                        <span className="text-sm">Add Sub-Admin</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Info + Logout Section */}
        <SidebarGroup className="mt-auto border-t border-sidebar-border">
          <SidebarGroupContent className="p-3">
            {/* User Info Card */}
            <div
              className={`flex items-center gap-3 p-3 mb-2 rounded-lg bg-sidebar-accent/50 transition-all ${
                !open ? "justify-center p-2" : ""
              }`}
            >
              <div className={`flex items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold ${open ? "w-9 h-9" : "w-8 h-8"} transition-all`}>
                {open ? (
                  <span className="text-sm">{getInitials(userInfo?.username)}</span>
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              {open && (
                <div className="flex flex-col min-w-0 flex-1">
                  <p className="text-sm font-semibold text-sidebar-foreground truncate">
                    {userInfo?.username}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {userInfo?.role}
                  </p>
                </div>
              )}
            </div>

            {/* Logout Button */}
            <SidebarMenu>
              <SidebarMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <SidebarMenuButton className="w-full hover:bg-red-500/10 hover:text-red-600 transition-all duration-200 group">
                      <LogOut className="h-4 w-4 transition-transform group-hover:scale-110" />
                      <span className="text-sm font-medium">Logout</span>
                    </SidebarMenuButton>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to log out? You'll need to sign in again to access your account.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={logout}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Logout
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
