import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useLogin } from "@/controllers/useAuth";
import { LogIn, Shield, Zap, Lock, Package, Warehouse, Truck } from "lucide-react";

const LoginPage = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { mutate: login, isPending } = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ username, password });
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding (50% width on large screens) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20" />

        <div className="relative z-10 flex flex-col justify-center items-center text-white px-12">
          {/* Logo / Icon */}
          <div className="mb-12 p-8 bg-white/10 backdrop-blur-md rounded-3xl">
            <Package className="w-24 h-24" />
          </div>

          <h1 className="text-5xl font-bold mb-6 text-center">
            Inventory Management System
          </h1>
          <p className="text-xl text-center opacity-90 max-w-md">
            Streamline your stock, track movements, and manage your inventory
            efficiently.
          </p>

          <div className="mt-16 grid grid-cols-3 gap-8 text-center">
            <div>
              <div className="bg-white/20 p-4 rounded-xl inline-block mb-3">
                <Package className="w-8 h-8" />
              </div>
              <p className="text-sm">Efficient Stock</p>
            </div>
            <div>
              <div className="bg-white/20 p-4 rounded-xl inline-block mb-3">
                <Warehouse className="w-8 h-8" />
              </div>
              <p className="text-sm">Organized Storage</p>
            </div>
            <div>
              <div className="bg-white/20 p-4 rounded-xl inline-block mb-3">
                <Truck className="w-8 h-8" />
              </div>
              <p className="text-sm">Seamless Logistics</p>
            </div>
          </div>
        </div>

        {/* Decorative waves or background pattern (optional) */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 320" className="w-full h-48 fill-white/10">
            <path d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L0,320Z" />
          </svg>
        </div>
      </div>

      {/* Right Side - Login Form (Full width on mobile, 50% on large) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile-only simplified header */}
          <div className="text-center lg:text-left">
            <h2 className="text-4xl font-bold text-gray-900">Sign in</h2>
            <p className="mt-2 text-gray-600">
              Enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-5">
              <div>
                <Label htmlFor="username" className="text-base font-medium">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="mt-2 h-12 text-lg"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-base font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="mt-2 h-12 text-lg"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-14 text-lg font-semibold bg-indigo-600 hover:bg-indigo-700"
              disabled={isPending}
            >
              {isPending ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </Button>

            {/* Optional footer */}
            <p className="text-center text-sm text-gray-600 mt-8">
              Don't have an account?{" "}
              <a
                href="#"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Contact admin
              </a>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
