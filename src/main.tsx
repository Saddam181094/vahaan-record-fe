import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { AuthProvider } from "./context/AuthContext";
import App from './App.tsx'
import { BrowserRouter } from 'react-router-dom';
import { LoadingProvider } from "@/components/LoadingContext";
import GlobalLoader from "@/components/GlobalLoader";
import { DialogProvider } from './components/DialogProvider.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
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
  </StrictMode>,
)
