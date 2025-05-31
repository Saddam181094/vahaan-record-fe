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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      setError("");
      await login(email, password);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className={cn("flex flex-col gap-6 min-h-screen bg-[#f8f9fb] dark:bg-white", className)} {...props}>
      <Card className="overflow-hidden md:mx-30 sm:mx-0 shadow-xl border-0 bg-white dark:bg-white">
      <CardContent className="grid px-0 md:grid-cols-1 sm:px-5">
        <form
        className="p-8 md:p-7 bg-white dark:bg-white rounded-2xl shadow-md"
        onSubmit={handleSubmit}
        >
        <div className="flex flex-col gap-7">
          <div className="flex flex-col items-center text-center">
          <h1 className="text-3xl font-extrabold pb-4 text-[#584ff7]">Welcome</h1>
          <p className="text-[#8a8fa3] text-balance">
            Login to your Adviz Portal account
          </p>
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
          <div className="flex items-center">
            <Label htmlFor="password" className="text-black font-medium">Password</Label>
          </div>
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
            className="underline cursor-pointer flex items-center gap-2 text-gray hover:text-[#3e36b0] transition-colors duration-150 w-max"
            onClick={() => setShowForgotModal(true)}
            >
            Forgot your password?
            </div>
          <ForgotPasswordModal
          open={showForgotModal}
          onOpenChange={setShowForgotModal}
          />
          <Button
          type="submit"
          className="mx-auto w-full bg-[#584ff7] hover:bg-[#3e36b0] cursor-pointer text-white font-semibold rounded-lg py-2 transition-colors duration-150 shadow"
          disabled={loading}
          >
          {loading ? (
            <div className="loader w-5 h-5 border-3 border-t-2 border-white rounded-full animate-spin"></div>
          ) : (
            "Login"
          )}
          </Button>
          {error && (
          <p className="text-red-500 underline text-sm mt-2 text-center">{error}</p>
          )}
          <div className="text-center text-sm text-[#8a8fa3]">
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="underline underline-offset-4 text-[#584ff7] hover:text-[#3e36b0]">
            Sign up
          </Link>
          </div>
        </div>
        </form>
        {/* <div className="bg-[#f4f6fa] flex rounded-2xl ml-6 mt-6 hidden md:flex items-center justify-center">
        <img
          src="/vite.svg"
          alt="Image"
          className="h-32 w-32 object-contain opacity-80"
        />
        </div> */}
      </CardContent>
      </Card>
    </div>
  );
}
