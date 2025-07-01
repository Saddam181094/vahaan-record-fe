import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { forgotPassword } from "@/service/auth.service"
import { useToast } from "@/context/ToastContext"
import { useAuth } from "@/context/AuthContext"

export interface ForgotPasswordModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ForgotPasswordModal({open, onOpenChange}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const {logout} = useAuth();
  // const [error, setError] = useState("")
  const toast = useToast();
  const [loading, setLoading] = useState(false)
//   const [open, onOpenChange] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await forgotPassword(email)
      setMessage(res)
          toast.showToast('Submitting forgot password for:',email,'info');
    } catch (err: any) {
              if(err?.status == '401' || err?.response?.status == '401')
        {
          toast.showToast('Error', 'Session Expired', 'error');
          logout();
        }
        toast.showToast('Error:',err?.message || 'Error during process Occured','error');
      // setError(err.message)
    } finally {
    // console.log("Submitting forgot password for", email);
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset Your Password</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Button style={{cursor:"pointer"}} type="submit" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </Button>
          {message && <p className="text-green-600 text-sm">{message}</p>}
          {/* {error && <p className="text-red-600 text-sm">{error}</p>} */}
        </form>
      </DialogContent>
    </Dialog>
  )
}
