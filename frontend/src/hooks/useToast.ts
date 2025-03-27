import { useCallback } from 'react';
import { toast, ToastOptions } from 'react-toastify';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface UseToastReturn {
  showToast: (type: ToastType, message: string, options?: ToastOptions) => void;
}

export const useToast = (): UseToastReturn => {
  const showToast = useCallback((type: ToastType, message: string, options?: ToastOptions) => {
    const defaultOptions: ToastOptions = {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      ...options
    };

    switch (type) {
      case 'success':
        toast.success(message, defaultOptions);
        break;
      case 'error':
        toast.error(message, defaultOptions);
        break;
      case 'info':
        toast.info(message, defaultOptions);
        break;
      case 'warning':
        toast.warning(message, defaultOptions);
        break;
      default:
        toast(message, defaultOptions);
    }
  }, []);

  return { showToast };
};
