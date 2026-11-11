import { isAxiosError } from "axios";
import { toast } from "sonner";

export function handleError(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    const message = error.response?.data?.message;
    toast.error(Array.isArray(message) ? message[0] : message ?? fallback);
    return;
  }
  toast.error(fallback);
}
