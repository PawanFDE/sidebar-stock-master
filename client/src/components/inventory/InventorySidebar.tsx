// View Component - Sidebar Navigation
import { NavLink } from "@/components/NavLink";
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
import { useLogout } from "@/controllers/useAuth"; // Import useLogout
import { useInventoryController } from "@/controllers/useInventoryController";
import {
  ArrowRightLeft,
  FolderOpen,
  LayoutDashboard,
  LogOut, // Import LogOut icon
  Package,
  UserPlus, // Import UserPlus icon for Add Sub-Admin
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
];

export function InventorySidebar() {
  const { open } = useSidebar();
  const { categories } = useInventoryController();
  const logout = useLogout(); // Initialize useLogout hook

  // Get user info from localStorage to check role
  const userInfoString = localStorage.getItem("userInfo");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const userRole = userInfo?.role;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        <div className="px-4 py-4">
          <h2
            className={`font-bold text-lg text-sidebar-foreground transition-opacity ${
              !open ? "opacity-0" : "opacity-100"
            }`}
          >
            Fardar Express Domestic
          </h2>
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      key={item.title}
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      activeClassName="bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              {userRole === "superadmin" && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to="/add-subadmin"
                      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      activeClassName="bg-sidebar-primary text-sidebar-primary-foreground font-medium"
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>Add Sub-Admin</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Info + Logout */}
        <SidebarGroup className="mt-auto px-3 pb-4">
          <SidebarGroupContent>
            <div
              className={`flex items-center gap-3 p-3 rounded-lg transition-all
        ${open ? "bg-sidebar-accent/30" : "justify-center"}
      `}
            >
              {open && (
                <div className="flex flex-col">
                  <p className="text-sm font-semibold text-sidebar-foreground">
                    {userInfo?.username}
                  </p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {userInfo?.role}
                  </p>
                </div>
              )}
            </div>

            <SidebarMenu>
              <SidebarMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <SidebarMenuButton className="hover:bg-red-500/15 hover:text-red-500 transition-colors">
                      <LogOut className="h-4 w-4" />
                      <span>Logout</span>
                    </SidebarMenuButton>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to log out?
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={logout}>
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
