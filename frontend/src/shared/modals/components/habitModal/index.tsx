import { useForm } from "react-hook-form";
import { FormInput } from "@shared/components/form_input";
import { zodResolver } from "@hookform/resolvers/zod";
import { habitCreateSchema, type HabitCreateValues } from "../../service/validation";
import { useState } from "react";

type Props = {
    id: string;
    title?: string;
    onCancel: () => void;
    folder: {
        id: number;
        title: string;
    }
}

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function HabitModal({
    title, onCancel, folder
}: Props) {
    const [habitType, setHabitType] = useState<'default' | 'timer' | 'counter'>('default');
    
    const {
        register,
        handleSubmit,
        formState: {errors, isSubmitting},
        watch,
        setValue,
    } = useForm<HabitCreateValues>({ 
        resolver: zodResolver(habitCreateSchema),
        defaultValues: {
            folder_id: folder.id,
            habit_type: 'default',
            active_days: "1,2,3,4,5,6,7" // Default to all days
        }
    });

    const activeDays = watch('active_days') || "";
    const activeDaysArray = activeDays.split(',').map(Number);

    const toggleDay = (day: number) => {
        const newActiveDays = activeDaysArray.includes(day)
            ? activeDaysArray.filter(d => d !== day)
            : [...activeDaysArray, day];
        
        setValue('active_days', newActiveDays.sort().join(','));
    };

    const onSubmit = async (values: HabitCreateValues) => {
        try {
            console.log(values);
            // onResolve();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg max-w-2xl w-full p-6">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                    {title || "Create Habit"}
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <FormInput 
                        label="Habit Title" 
                        type="text" 
                        placeholder="Enter habit title"
                        {...register("title")}
                        error={errors.title}
                    />

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description
                        </label>
                        <textarea
                            placeholder="Enter habit description"
                            {...register("description")}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                            rows={3}
                        />
                        {errors.description && (
                            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Folder
                        </label>
                        <input
                            type="hidden"
                            {...register("folder_id")}
                        />
                        <div className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg text-gray-700 dark:text-gray-300">
                            [ {folder.id} ]: {folder.title}
                        </div>
                        {errors.folder_id && (
                            <p className="mt-1 text-sm text-red-600">{errors.folder_id.message}</p>
                        )}
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Habit Type
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { value: 'default', label: 'Default' },
                                { value: 'timer', label: 'Timer' },
                                { value: 'counter', label: 'Counter' }
                            ].map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => {
                                        setHabitType(type.value as any);
                                        setValue('habit_type', type.value as any);
                                    }}
                                    className={`py-2 px-4 rounded-md font-medium text-center ${
                                        habitType === type.value
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                        <input
                            type="hidden"
                            {...register("habit_type")}
                        />
                        {errors.habit_type && (
                            <p className="mt-1 text-sm text-red-600">{errors.habit_type.message}</p>
                        )}
                    </div>

                    {(habitType === 'timer' || habitType === 'counter') && (
                        <>HERE SHOULD BE TARGET VALUE</>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Active Days
                        </label>
                        <div className="flex gap-2">
                            {daysOfWeek.map((day, index) => {
                                const dayNumber = index + 1;
                                const isActive = activeDaysArray.includes(dayNumber);
                                
                                return (
                                    <button
                                        key={day}
                                        type="button"
                                        onClick={() => toggleDay(dayNumber)}
                                        className={`h-10 w-10 rounded-full flex items-center justify-center font-medium ${
                                            isActive
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                                        }`}
                                        title={day}
                                    >
                                        {day.charAt(0)}
                                    </button>
                                );
                            })}
                        </div>
                        <input
                            type="hidden"
                            {...register("active_days")}
                        />
                        {errors.active_days && (
                            <p className="mt-1 text-sm text-red-600">{errors.active_days.message}</p>
                        )}
                    </div>

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
                            ) : "Create Habit"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}