import { Link } from "react-router-dom";
import type { Habit } from "@app/habits/service/types";
import { formatTime } from "@shared/utils";

interface HabitCardProps {
    habit: Habit;
}

export default function HabitCard({ habit }: HabitCardProps) {
    const percentage = ((habit.record?.current_value as number)/(habit.target_value as number)*100).toString().substring(0, 4)
    
    return (
        <div
            className={`rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-100 dark:bg-gray-700`}
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
                                        {habit.record.current_value} / {habit.target_value}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">progress ({percentage}%)</div>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {formatTime(habit.record.current_value || 0)} / {formatTime(habit.target_value || 0)}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">time spent ({percentage}%)</div>
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