import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from "./context/AuthContext";
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
import { LoadingProvider } from "@/components/LoadingContext";
import GlobalLoader from "@/components/GlobalLoader";
import { DialogProvider } from './components/DialogProvider.tsx';
import { ToastProvider } from './context/ToastContext.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
            <ToastProvider>
<LoadingProvider>
  <GlobalLoader/>
    <BrowserRouter>
      <AuthProvider>

        <DialogProvider>
        <App />
        </DialogProvider>

      </AuthProvider>
    </BrowserRouter>
    </LoadingProvider>
            </ToastProvider>
  </StrictMode>,
)
