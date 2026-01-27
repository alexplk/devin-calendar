'use client';

import React, { useMemo } from 'react';

interface CalendarProps {
  year: number;
  startMonth: number;
  endMonth: number;
  getData?: (year: number, month: number, day: number) => string;
}

export function Calendar({ year, startMonth, endMonth, getData }: CalendarProps) {
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const today = new Date();
  const currentDay = today.getDate();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const months = useMemo(() => {
    const result = [];
    for (let m = startMonth; m <= endMonth; m++) {
      const date = new Date(year, m - 1, 1);
      const daysInMonth = new Date(year, m, 0).getDate();
      const firstDayOfWeek = date.getDay();
      const startDay = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

      const weeks: (number | null)[][] = [[]];
      for (let i = 0; i < startDay; i++) {
        weeks[0].push(null);
      }

      for (let day = 1; day <= daysInMonth; day++) {
        if (weeks[weeks.length - 1].length === 7) {
          weeks.push([]);
        }
        weeks[weeks.length - 1].push(day);
      }

      while (weeks[weeks.length - 1].length < 7) {
        weeks[weeks.length - 1].push(null);
      }

      result.push({
        month: monthNames[m - 1],
        monthNumber: m,
        weeks
      });
    }
    return result;
  }, [year, startMonth, endMonth]);

  const maxWeeks = Math.max(...months.map(m => m.weeks.length));

  return (
    <div className="overflow-x-auto">
      <table className="border-collapse border-2 border-gray-300 text-sm dark:border-gray-700">
        <thead>
          <tr className="border-b-2 border-gray-300 dark:border-gray-700">
            <th
              colSpan={1 + months.length * 2}
              className="px-4 py-3 text-center font-bold text-lg text-gray-900 dark:text-white"
            >
              {year} DEVIN'S BIKE &amp; NO BIKE SCHEDULE
            </th>
          </tr>
          <tr className="border-b-2 border-gray-300 dark:border-gray-700">
            <th className="w-12 border-r-2 border-gray-300 px-2 py-2 text-left font-semibold text-gray-700 dark:border-gray-700 dark:text-gray-300">
              Day
            </th>
            {months.map((m, index) => (
              <th
                key={m.monthNumber}
                colSpan={2}
                className={`border-gray-200 px-2 py-2 text-center font-semibold text-gray-700 dark:border-gray-800 dark:text-gray-300 border-l-2 border-r-2 border-l-gray-300 border-r-gray-300 dark:border-l-gray-700 dark:border-r-gray-700`}
              >
                {m.month}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: maxWeeks * 7 }).map((_, rowIndex) => {
            const dayOfWeek = rowIndex % 7;
            const weekNumber = Math.floor(rowIndex / 7);
            const isSunday = dayOfWeek === 6;

            return (
              <tr
                key={rowIndex}
                className={isSunday ? 'border-b-2 border-gray-300 dark:border-gray-700' : 'border-b border-gray-200 dark:border-gray-800'}
              >
                <td className="border-r-2 border-gray-300 px-2 py-1 text-center text-xs font-medium text-gray-600 dark:border-gray-700 dark:text-gray-400">
                  {dayNames[dayOfWeek]}
                </td>
                {months.map((m, index) => {
                  const day = m.weeks[weekNumber]?.[dayOfWeek];
                  const data = day ? getData?.(year, m.monthNumber, day) : '';
                  const isLastMonth = index === months.length - 1;
                  const isToday = day && year === currentYear && m.monthNumber === currentMonth && day === currentDay;
                  const isPastDate = day && (year < currentYear || (year === currentYear && m.monthNumber < currentMonth) || (year === currentYear && m.monthNumber === currentMonth && day < currentDay));

                  return (
                    <React.Fragment key={m.monthNumber}>
                      <td className={`px-2 py-0.5 text-center font-semibold border-r border-gray-200 dark:border-gray-800 border-l-2 border-l-gray-300 dark:border-l-gray-700 ${
                        isLastMonth ? 'border-r-2 border-r-gray-300 dark:border-r-gray-700' : ''
                      } ${
                        isPastDate ? 'text-gray-400 dark:text-gray-600' : 'text-gray-900 dark:text-white'
                      }`}>
                        {isToday ? (
                          <span className="relative inline-block h-6 w-6 rounded-full border-2 border-red-500 flex items-center justify-center">
                            {day}
                          </span>
                        ) : (
                          day
                        )}
                      </td>
                      <td className={`px-2 py-0.5 text-center text-xs dark:text-gray-400 ${
                        isLastMonth ? 'border-r-2 border-r-gray-300 dark:border-r-gray-700' : 'border-r border-gray-200 dark:border-gray-800'
                      } ${
                        isPastDate ? 'text-gray-400 dark:text-gray-600' : 'text-gray-600'
                      }`}>
                        {data}
                      </td>
                    </React.Fragment>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
