import { Link } from "react-router-dom";
import type { Habit } from "@app/habits/service/types";
import { formatTime } from "@shared/utils";

interface HabitCardProps {
    habit: Habit;
}

export default function HabitCard({ habit }: HabitCardProps) {
    const getStatusStyle = () => {
        if (!habit.record) return "bg-gray-100 dark:bg-gray-700";

        if (habit.habit_type === "default") {
            return habit.record.is_completed
                ? "bg-green-100 dark:bg-green-900"
                : "bg-orange-100 dark:bg-orange-900";
        }

        const progress = (habit.record.value_achieved || 0) / (habit.target_value || 1);

        if (progress >= 1) {
            return "bg-green-100 dark:bg-green-900";
        } else if (progress >= 0.5) {
            return "bg-blue-100 dark:bg-blue-900";
        } else {
            return "bg-purple-100 dark:bg-purple-900";
        }
    };

    return (
        <div
            className={`rounded-lg border border-gray-200 dark:border-gray-700 p-4 ${getStatusStyle()}`}
        >
            <div className="flex flex-col">
                <div className="mb-3">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{habit.title}</h3>
                    {habit.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {habit.description}
                        </p>
                    )}
                </div>

                <div className="mt-2">
                    {!habit.record ? (
                        <div className="space-y-2">
                            <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>
                                    {habit.habit_type === "default"
                                        ? "Not started"
                                        : habit.habit_type === "counter"
                                            ? `Target: ${habit.target_value}`
                                            : `Target: ${formatTime(habit.target_value || 0)}`
                                    }
                                </span>
                            </div>

                            <Link
                                to={`/habits/${habit.id}`}
                                className="block w-full py-2 text-center bg-gray-800 dark:bg-gray-600 text-white rounded-md text-sm"
                            >
                                Start
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {habit.habit_type === "default" ? (
                                <div className={`py-2 px-3 rounded-md text-center text-sm ${habit.record.is_completed ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200' : 'bg-orange-200 dark:bg-orange-800 text-orange-800 dark:text-orange-200'}`}>
                                    {habit.record.is_completed ? "Completed" : "Not completed"}
                                </div>
                            ) : habit.habit_type === "counter" ? (
                                <div className="text-center">
                                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {habit.record.value_achieved} / {habit.target_value}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">progress</div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {formatTime(habit.record.value_achieved || 0)} / {formatTime(habit.target_value || 0)}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">time spent</div>
                                </div>
                            )}

                            <Link
                                to={`/habits/${habit.id}`}
                                className="block w-full py-2 text-center bg-gray-700 dark:bg-gray-600 text-white rounded-md text-sm"
                            >
                                Continue
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}