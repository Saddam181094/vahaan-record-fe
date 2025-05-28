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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden md:mx-30 sm:mx-0">
        <CardContent className="grid px-0 md:grid-cols-1 sm:px-5">
          <form className="p-6 md:p-5 bg-stone-200 dark:bg-stone-100 rounded-xl" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold pb-5">Welcome</h1>
                <p className="text-muted-foreground text-balance">
                  Login to your Adviz Portal account
                </p>
              </div>
                <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  className=""
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
                  <Label htmlFor="password">Password</Label>

                  {/* <a
                    href="#"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Forgot your password?
                  </a> */}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  onFocus={(e) => (e.target.placeholder = "")}
                  onBlur={(e) => (e.target.placeholder = "••••••••")}
                />
              </div>
              <div
                className="underline cursor-pointer flex items-center gap-2"
                onClick={() => setShowForgotModal(true)}
              >
                Forgot your password?
              </div>
              <ForgotPasswordModal
                open={showForgotModal}
                onOpenChange={setShowForgotModal}
              />
              <Button type="submit" className="mx-40">
                {loading ? (
                  <div className="loader w-5 h-5 border-3 border-t-2 border-white rounded-full animate-spin"></div>
                ) : (
                  "Login"
                )}
              </Button>
              {error && (
                <p className="text-red-600 underline text-sm mt-2">{error}</p>
              )}
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="underline underline-offset-4">
                  Sign up
                </Link>
              </div>
            </div>
          </form>
          <div className="bg-muted relative md:block">
            <img
              src="/vite.svg"
              alt="Image"
              className="absolute inset-0 h-full dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      {/* <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div> */}
    </div>
  );
}
