import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import './index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60, // 1 minute
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Toast notification configuration
const toastOptions = {
  position: 'top-right',
  duration: 4000,
  style: {
    background: '#fff',
    color: '#1f2937',
    borderRadius: '8px',
    padding: '12px 16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  success: {
    iconTheme: {
      primary: '#059669',
      secondary: '#fff',
    },
    style: {
      borderLeft: '4px solid #059669',
    },
  },
  error: {
    iconTheme: {
      primary: '#dc2626',
      secondary: '#fff',
    },
    style: {
      borderLeft: '4px solid #dc2626',
    },
  },
  loading: {
    iconTheme: {
      primary: '#2563eb',
      secondary: '#fff',
    },
    style: {
      borderLeft: '4px solid #2563eb',
    },
  },
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster {...toastOptions} />
        <App />
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
