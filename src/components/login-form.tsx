import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";
import type { FormEvent } from "react";
import { ForgotPasswordModal } from "./forgotPass";
import { Link } from "react-router-dom";

import type { HTMLAttributes } from "react";
import { useToast } from "@/context/ToastContext";

export function LoginForm({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e: FormEvent) => {
  e.preventDefault();
  setLoading(true);
  setError(""); // Clear error before submission

  try {
    await login(email, password);
  } catch (err: any) {
    console.error("Login Error:", err);
    
    // Handle known error structure or fallback
    const errorMessage = err?.response?.data?.message || err?.message || "Login failed";

    setError(errorMessage);

    // Optional: Keep toast, but guard against structure issues
    toast.showToast('Login Error', errorMessage, 'error');
  } finally {
    setLoading(false);
  }
};

  return (
<div className={cn("flex flex-col gap-6 bg-[#f8f9fb] dark:bg-white my-5", className)} {...props}>
  <Card className="overflow-hidden mx-auto shadow-xl border-0 bg-white dark:bg-white">
    <CardContent className="grid md:grid-cols-2 sm:grid-cols-1 p-0">
      {/* Login Form Section */}
      <div className="p-8 md:p-12 bg-white dark:bg-white flex items-center justify-center">
        <form className="w-full max-w-md" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-7">
            <div className="text-center">
              <h1 className="text-3xl font-extrabold pb-2 text-[#584ff7]">Welcome</h1>
              <p className="text-[#8a8fa3]">Login to your Vahaan Record Portal</p>
            </div>

            <div className="grid gap-3">
              <Label htmlFor="email" className="text-black font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                className="bg-[#f4f6fa] border border-[#e0e4f6] focus:border-[#584ff7] focus:ring-[#584ff7] text-[#2d2d2d] placeholder:text-[#b3b6c6] rounded-lg"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "m@example.com")}
              />
            </div>

            <div className="grid gap-3">
              <Label htmlFor="password" className="text-black font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-[#f4f6fa] border border-[#e0e4f6] focus:border-[#584ff7] focus:ring-[#584ff7] text-[#2d2d2d] placeholder:text-[#b3b6c6] rounded-lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                onFocus={(e) => (e.target.placeholder = "")}
                onBlur={(e) => (e.target.placeholder = "••••••••")}
              />
            </div>

            <div
              className="underline cursor-pointer text-sm text-gray-600 hover:text-[#3e36b0] w-max"
              onClick={() => setShowForgotModal(true)}
            >
              Forgot your password?
            </div>

            <ForgotPasswordModal open={showForgotModal} onOpenChange={setShowForgotModal} />

            <Button
            style={{cursor:"pointer"}}
              type="submit"
              className="w-full bg-[#584ff7] hover:bg-[#3e36b0] text-white font-semibold rounded-lg py-2 transition-colors duration-150 shadow"
              disabled={loading}
            >
              {loading ? (
                <div className="loader w-5 h-5 border-3 border-t-2 border-white rounded-full animate-spin"></div>
              ) : (
                "Login"
              )}
            </Button>

            {error && (
              <p className="text-red-500 text-sm mt-2 text-center underline">{error}</p>
            )}

            <div className="text-center text-sm text-[#8a8fa3]">
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="underline text-[#584ff7] hover:text-[#3e36b0]">
                Sign up
              </Link>
            </div>
          </div>
        </form>
      </div>

      {/* Image Section */}
      <div className="bg-[#f4f6fa] mr-8 p-8 hidden md:flex items-center justify-center rounded-r-2xl">
        <img
          src="/g10.svg"
          alt="Login Illustration"
          className="w-[100%] h-[70%] object-cover"
        />
      </div>
    </CardContent>
  </Card>
</div>

  );
}
