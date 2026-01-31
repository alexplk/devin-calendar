import React from 'react';
import { Schedule } from '@/services/schedule-service';

interface ForecastWidgetProps {
  date: Date;
  messages: string[];
  getData?: (year: number, month: number, day: number) => string;
}

export function ForecastWidget({ date, messages, getData }: ForecastWidgetProps) {
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  // Get the two weeks of days starting from the week containing today
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Find Monday of the week containing today
  const startOfWeek = new Date(date);
  const currentDay = startOfWeek.getDay();
  const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
  startOfWeek.setDate(startOfWeek.getDate() + mondayOffset);
  
  // Create two weeks of data
  const weeks: Date[][] = [[], []];
  for (let week = 0; week < 2; week++) {
    for (let day = 0; day < 7; day++) {
      const currentDate = new Date(startOfWeek);
      currentDate.setDate(startOfWeek.getDate() + (week * 7) + day);
      weeks[week].push(currentDate);
    }
  }

  const isToday = (checkDate: Date) => {
    return checkDate.getDate() === date.getDate() &&
           checkDate.getMonth() === date.getMonth() &&
           checkDate.getFullYear() === date.getFullYear();
  };

  return (
    <section className="w-full flex justify-center mb-10">
      <div className="relative flex flex-col items-center w-full max-w-2xl rounded-3xl bg-white/90 dark:bg-gray-900/90 shadow-xl px-8 pt-6 pb-10 border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
          <span className="inline-block h-4 w-4 rounded-full bg-blue-400 animate-pulse shadow-lg"></span>
          <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 tracking-widest uppercase">Forecast</span>
        </div>
        <div className="mb-2 text-center">
          <span className="block text-lg font-semibold text-gray-500 dark:text-gray-400 tracking-wide uppercase mb-1">Today</span>
          <span className="block text-2xl font-bold text-gray-900 dark:text-white tracking-tight mb-2 drop-shadow-sm">
            {dateFormatter.format(date)}
          </span>
        </div>
        {messages.length > 0 ? (
          <div className="flex flex-col items-center gap-4 mt-2 w-full">
            {messages.map((forecast, index) => (
              <div
                key={index}
                className="w-full rounded-xl bg-gradient-to-r from-blue-100/80 via-blue-50/80 to-blue-200/80 dark:from-blue-900/80 dark:via-blue-800/80 dark:to-blue-900/80 px-6 py-6 text-4xl font-extrabold text-center text-blue-900 dark:text-blue-200 tracking-tight shadow-md border border-blue-200 dark:border-blue-800"
                style={{letterSpacing: '0.01em'}}
              >
                {forecast}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 mt-4 text-xl">No forecast</div>
        )}
        
        {/* Two-week calendar */}
        <div className="mt-8 w-full overflow-x-auto">
          <table className="border-collapse border-2 border-gray-300 dark:border-gray-700 w-full text-sm table-fixed">
            <colgroup>
              {dayNames.map((_, index) => (
                <col key={index} style={{ width: '14.2857%' }} />
              ))}
            </colgroup>
            <thead>
              <tr className="border-b-2 border-gray-300 dark:border-gray-700">
                {dayNames.map((dayName, index) => (
                  <th
                    key={dayName}
                    className={`px-2 py-0.5 text-center font-semibold text-gray-700 dark:text-gray-300 ${
                      index === 0 ? 'border-l-2' : 'border-l'
                    } ${
                      index === 6 ? 'border-r-2' : 'border-r'
                    } border-gray-300 dark:border-gray-700`}
                  >
                    {dayName}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weeks.map((week, weekIndex) => (
                <React.Fragment key={weekIndex}>
                  {/* Day numbers row */}
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    {week.map((dayDate, dayIndex) => {
                      const isPast = dayDate < date && !isToday(dayDate);
                      return (
                        <td
                          key={dayIndex}
                          className={`px-2 py-0.5 text-center font-semibold ${
                            dayIndex === 0 ? 'border-l-2' : 'border-l'
                          } ${
                            dayIndex === 6 ? 'border-r-2' : 'border-r'
                          } border-gray-300 dark:border-gray-700 ${
                            isPast ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'
                          }`}
                        >
                          {isToday(dayDate) ? (
                            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full border-2 border-red-500">
                              {dayDate.getDate()}
                            </span>
                          ) : (
                            dayDate.getDate()
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  {/* Data row */}
                  <tr className={weekIndex === 1 ? 'border-b-2 border-gray-300 dark:border-gray-700' : 'border-b-2 border-gray-300 dark:border-gray-700'}>
                    {week.map((dayDate, dayIndex) => {
                      const data = getData?.(dayDate.getFullYear(), dayDate.getMonth() + 1, dayDate.getDate()) || '';
                      const isPast = dayDate < date && !isToday(dayDate);
                      return (
                        <td
                          key={dayIndex}
                          className={`px-2 py-1 text-center text-xs ${
                            dayIndex === 0 ? 'border-l-2' : 'border-l'
                          } ${
                            dayIndex === 6 ? 'border-r-2' : 'border-r'
                          } border-gray-300 dark:border-gray-700 ${
                            isPast ? 'text-gray-400 dark:text-gray-600' : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {data}
                        </td>
                      );
                    })}
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
