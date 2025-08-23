import { useForm } from "react-hook-form";
import { folderCreateSchema, type FolderCreateValues } from "../service/validation";
import { FormInput } from "@shared/components/form_input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Field, Input, Label } from "@headlessui/react";
import { HexColorPicker } from "react-colorful";
import api from "@shared/api";
import { useAppDispatch } from "@shared/store";
import { foldersActions } from "@app/folders/redux";
import { AxiosError } from "axios";
import { toastBus } from "@shared/bus";

type Props = {
    id: string;
    title?: string;
    onCancel: () => void;
}

export default function FolderModal({
    title, onCancel
}: Props) {
    const dispatch = useAppDispatch();
    const {
        watch,
        register,
        setValue,
        handleSubmit,
        formState: {errors, isSubmitting},
    } = useForm<FolderCreateValues>({ resolver: zodResolver(folderCreateSchema) });

    const onSubmit = async (values: FolderCreateValues) => {
        try {
            console.log(values);
            
            const response = await api.post("/folders/", values)
            
            if (response.status === 201) {
                dispatch(foldersActions.addOne(response.data))
                onCancel()
            }
        } catch (error) {
            console.error(error);
            if (error instanceof AxiosError) {
                toastBus.emit({message: error.response?.data.detail || "Unknown error", type: "error"})
            }
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-md w-full p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                    {title || "Create Folder"}
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FormInput 
                        label="Folder Name" 
                        type="text" 
                        placeholder="Enter folder name"
                        {...register("title")}
                        error={errors.title}
                    />

                    <Field className="flex flex-col gap-1.5 w-full">
                        <Label>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Color
                            <span className="text-red-500 ml-0.5">*</span>
                            </span>
                        </Label>
                        <HexColorPicker color={watch("color")} onChange={(color) => setValue("color", color)} />
                        <Input type="hidden" {...register("color")} />
                    </Field>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="flex-1 py-2 px-4 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={[
                                "flex-1 py-2 px-4 rounded-lg font-medium text-white shadow-md",
                                "bg-gradient-to-r from-blue-600 to-indigo-600",
                                "hover:from-blue-700 hover:to-indigo-700",
                                "transition-all duration-200",
                                "disabled:opacity-70 disabled:cursor-not-allowed",
                                "flex items-center justify-center gap-2"
                            ].join(" ")}
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Creating...
                                </>
                            ) : "Create Folder"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}