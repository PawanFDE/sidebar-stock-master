import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { InventorySidebar } from "@/components/inventory/InventorySidebar";
import Dashboard from "./pages/Dashboard";
import InventoryList from "./pages/InventoryList";
import AddItem from "./pages/AddItem";
import Categories from "./pages/Categories";
import TransferredItemsList from "./pages/TransferredItemsList";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <SidebarProvider>
          <div className="flex min-h-screen w-full bg-background">
            <InventorySidebar />
            <div className="flex-1 flex flex-col">
              <header className="sticky top-0 z-10 h-14 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="flex h-full items-center gap-4 px-6">
                  <SidebarTrigger className="-ml-1" />
                </div>
              </header>
              <main className="flex-1 p-6">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/inventory" element={<InventoryList />} />
                  <Route path="/add-item" element={<AddItem />} />
                  <Route path="/categories" element={<Categories />} />
                  <Route path="/transferred-items" element={<TransferredItemsList />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
