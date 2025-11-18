import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import InventoryList from "./pages/InventoryList";
import AddItem from "./pages/AddItem";
import Categories from "./pages/Categories";
import TransferredItemsList from "./pages/TransferredItemsList";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import { AddSubAdminPage } from "./pages/AddSubAdminPage";
import ProtectedRoute from "./components/ProtectedRoute"; // Import ProtectedRoute
import { MainLayout } from "@/components/MainLayout"; // Import MainLayout
import { Toaster } from "@/components/ui/toaster";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route element={<MainLayout />}>
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/inventory" element={<InventoryList />} />
            <Route path="/add-item" element={<AddItem />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/transferred-items" element={<TransferredItemsList />} />
          </Route>
          <Route element={<ProtectedRoute allowedRoles={['superadmin']} />}>
            <Route path="/add-subadmin" element={<AddSubAdminPage />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
