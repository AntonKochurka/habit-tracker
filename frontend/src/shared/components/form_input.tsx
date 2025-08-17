import type { FieldError } from "react-hook-form";
import { Field, Label, Input } from "@headlessui/react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: FieldError;
  containerClass?: string;
};

export function FormInput({ label, error, className, containerClass, ...props }: Props) {
  return (
    <Field className={`flex flex-col gap-1.5 w-full ${containerClass}`}>
      {label && (
        <Label>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
            {props.required && <span className="text-red-500 ml-0.5">*</span>}
            </span>
        </Label>
      )}
      <Input
        {...props}
        className={[
          "w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition-all",
          "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
          "dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400",
          "disabled:bg-gray-100 disabled:cursor-not-allowed dark:disabled:bg-gray-700",
          error 
            ? "border-red-500 focus:ring-red-300 dark:border-red-400" 
            : "border-gray-300 hover:border-gray-400",
          className || "",
        ].join(" ")}
      />
      {error && (
        <span className="text-xs text-red-600 dark:text-red-400 mt-0.5">
          {error.message}
        </span>
      )}
    </Field>
  );
}