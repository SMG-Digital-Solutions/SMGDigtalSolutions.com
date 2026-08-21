import { WarningCircle } from '@phosphor-icons/react';

interface FormErrorMessageProps {
  message: string;
}

/**
 * Accessible error banner for form submission failures. `role="alert"`
 * makes assistive tech announce it as soon as it mounts, so a screen reader
 * user gets the same "something went wrong" signal a sighted user gets from
 * the red banner — without this, a failed submit was previously silent
 * (the loading spinner just stopped, with no explanation).
 */
export default function FormErrorMessage({ message }: FormErrorMessageProps) {
  return (
    <div
      role="alert"
      className="flex items-start gap-2 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-700 dark:border-red-400/30 dark:bg-red-400/10 dark:text-red-300"
    >
      <WarningCircle size={18} weight="bold" className="mt-0.5 shrink-0" aria-hidden="true" />
      <span>{message}</span>
    </div>
  );
}
