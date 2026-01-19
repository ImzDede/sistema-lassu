"use client";

import { useState } from "react";
import { useFeedback } from "@/contexts/FeedbackContext";
import { getErrorMessage, getFieldErrors } from "@/utils/error";

export function useFormHandler() {
  const { showFeedback } = useFeedback();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    action: () => Promise<void>,
    onSuccess?: () => void,
    onError?: ((error: any) => void) | ((error: any, fieldErrors: Record<string, string>) => void)
  ) => {
    setLoading(true);
    try {
      await action();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      const message = getErrorMessage(err);
      showFeedback(message, "error");

      const fieldErrors = getFieldErrors(err);

      if (onError) {
        try {
          (onError as (error: any, fieldErrors: Record<string, string>) => void)(err, fieldErrors);
        } catch {
          (onError as (error: any) => void)(err);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return { loading, handleSubmit };
}