import { foldersActions } from "@app/folders/redux";
import { useAppDispatch } from "@shared/store";
import { useState, useRef, useEffect } from "react";
import { FaChevronLeft, FaChevronRight, FaCalendarAlt } from "react-icons/fa";
import { habitsActions } from "../redux";

export default function CalendarLine() {
  const dispatch = useAppDispatch();
  const [currentDate, setCurrentDate] = useState(new Date());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());

  useEffect(() => {
    dispatch(foldersActions.reset())
    dispatch(foldersActions.setFilters({created_at__le: currentDate.toISOString()}))
    dispatch(habitsActions.reset())
    dispatch(habitsActions.setCurrentDay(currentDate))
  }, [currentDate, dispatch])
  
  const generateDays = (date: Date) => {
    const days = [];
    for (let i = -15; i <= 15; i++) {
      const day = new Date(date);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const days = generateDays(currentDate);

  useEffect(() => {
    if (scrollContainerRef.current) {
      const centerIndex = 15;
      const centerElement = scrollContainerRef.current.children[0].children[centerIndex] as HTMLElement;
      if (centerElement) {
        scrollContainerRef.current.scrollLeft = centerElement.offsetLeft - 
          (scrollContainerRef.current.offsetWidth - centerElement.offsetWidth) / 2;
      }
    }
  }, [currentDate]);

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setViewMonth(today.getMonth());
    setViewYear(today.getFullYear());
    setShowFullCalendar(false);
  };

  const changeMonth = (increment: number) => {
    setViewMonth(prev => {
      let newMonth = prev + increment;
      let newYear = viewYear;
      
      if (newMonth < 0) {
        newMonth = 11;
        newYear--;
      } else if (newMonth > 11) {
        newMonth = 0;
        newYear++;
      }
      
      setViewYear(newYear);
      return newMonth;
    });
  };

  const changeYear = (increment: number) => {
    setViewYear(prev => prev + increment);
  };

  const formatDay = (date: Date) => {
    return date.getDate().toString();
  };

  const formatWeekday = (date: Date) => {
    return date.toLocaleString('en-US', { weekday: 'short' });
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const isSelected = (date: Date) => {
    return date.getDate() === currentDate.getDate() && 
           date.getMonth() === currentDate.getMonth() && 
           date.getFullYear() === currentDate.getFullYear();
  };

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(viewMonth, viewYear);
    const firstDay = getFirstDayOfMonth(viewMonth, viewYear);
    const days = [];
    
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(viewYear, viewMonth, i));
    }
    
    return days;
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="flex items-center justify-between p-1 bg-white dark:bg-gray-800 rounded-lg shadow relative h-10">
      <button
        onClick={handlePrev}
        className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 z-10"
      >
        <FaChevronLeft className="w-3 h-3 text-gray-600 dark:text-gray-300" />
      </button>
      
      <div
        ref={scrollContainerRef}
        className="flex-1 mx-1  overflow-x-auto scrollbar-hide"
      >
        <div className="flex space-x-0">
          {days.map((day, index) => (
            <div
              key={index}
              className={`flex flex-col items-center justify-center min-w-[36px] h-8 rounded cursor-pointer transition-all duration-200 mx-px ${
                isSelected(day)
                  ? "bg-blue-500 text-white shadow-md"
                  : isToday(day)
                  ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                  : "hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
              onClick={() => setCurrentDate(day)}
            >
              <span className={`text-[10px] font-medium ${
                isSelected(day) ? "text-white" : "text-gray-500 dark:text-gray-400"
              }`}>
                {formatWeekday(day)}
              </span>
              <span className={`text-xs font-bold ${
                isSelected(day) ? "text-white" : "text-gray-800 dark:text-white"
              }`}>
                {formatDay(day)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center">
        <button
          onClick={() => setShowFullCalendar(!showFullCalendar)}
          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <FaCalendarAlt className="w-3 h-3 text-gray-600 dark:text-gray-300" />
        </button>
        
        <button
          onClick={handleNext}
          className="p-1 ml-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
        >
          <FaChevronRight className="w-3 h-3 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {showFullCalendar && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 z-50">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => changeYear(-1)}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaChevronLeft className="w-3 h-3" />
              </button>
              <span className="text-sm font-medium">{viewYear}</span>
              <button 
                onClick={() => changeYear(1)}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaChevronRight className="w-3 h-3" />
              </button>
            </div>
            
            <div className="flex items-center space-x-1">
              <button 
                onClick={() => changeMonth(-1)}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaChevronLeft className="w-3 h-3" />
              </button>
              <span className="text-sm font-medium w-16 text-center">
                {monthNames[viewMonth]}
              </span>
              <button 
                onClick={() => changeMonth(1)}
                className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaChevronRight className="w-3 h-3" />
              </button>
            </div>
            
            <button
              onClick={() => setShowFullCalendar(false)}
              className="p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400"
            >
              ×
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400 py-1">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map((date, i) => {
              if (!date) {
                return <div key={i} className="p-1"></div>;
              }
              
              const isTodayDate = isToday(date);
              const isSelectedDate = isSelected(date);
              const isCurrentMonth = date.getMonth() === viewMonth;
              
              return (
                <button
                  key={i}
                  onClick={() => {
                    setCurrentDate(date);
                    setShowFullCalendar(false);
                  }}
                  className={`p-1 rounded-md text-xs transition-colors duration-200 ${
                    isSelectedDate
                      ? "bg-blue-500 text-white"
                      : isTodayDate
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300"
                      : isCurrentMonth
                      ? "text-gray-800 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                      : "text-gray-400 dark:text-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          <div className="flex justify-end mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleToday}
              className="px-2 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-xs font-medium"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}