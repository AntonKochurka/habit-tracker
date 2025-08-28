type Props = {
    type: 'timer' | 'counter';
    value: number;
    setValue: (value: number) => void;
}

export default function HabitTypeComponent({ type, value, setValue }: Props) {
    if (type === 'counter') {
        return (
            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Target Count
                </label>
                <div className="flex items-center">
                    <button
                        type="button"
                        onClick={() => setValue(Math.max(1, value - 1))}
                        className="p-2 bg-gray-200 dark:bg-gray-700 rounded-l-md hover:bg-gray-300 dark:hover:bg-gray-600"
                        disabled={value <= 1}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                    </button>
                    <div className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-center font-mono">
                        {value}
                    </div>
                    <button
                        type="button"
                        onClick={() => setValue(value + 1)}
                        className="p-2 bg-gray-200 dark:bg-gray-700 rounded-r-md hover:bg-gray-300 dark:hover:bg-gray-600"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </button>
                </div>
            </div>
        );
    }

    const hours = Math.floor(value / 3600);
    const minutes = Math.floor((value % 3600) / 60);
    const seconds = value % 60;

    const formatTime = (time: number) => time.toString().padStart(2, '0');

    const updateTime = (unit: 'hours' | 'minutes' | 'seconds', delta: number) => {
        let newValue = value;
        
        if (unit === 'hours') {
            newValue += delta * 3600;
        } else if (unit === 'minutes') {
            newValue += delta * 60;
        } else {
            newValue += delta;
        }
        
        setValue(Math.max(0, newValue));
    };

    return (
        <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Target Time
            </label>
            <div className="flex items-center justify-center space-x-2">
                {[['HH', hours, 'hours'], ['MM', minutes, 'minutes'], ['SS', seconds, 'seconds']].map(([label, time, unit]) => (
                    <div key={unit} className="flex flex-col items-center">
                        <button
                            type="button"
                            onClick={() => updateTime(unit as any, 1)}
                            className="p-1 bg-gray-200 dark:bg-gray-700 rounded-t-md hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                        </button>
                        <div className="w-16 bg-gray-100 dark:bg-gray-800 py-2 text-center font-mono">
                            {formatTime(time as number)}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{label}</div>
                        <button
                            type="button"
                            onClick={() => updateTime(unit as any, -1)}
                            className="p-1 bg-gray-200 dark:bg-gray-700 rounded-b-md hover:bg-gray-300 dark:hover:bg-gray-600"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}