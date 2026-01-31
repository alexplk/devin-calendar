'use client';

import { useEffect, useState } from 'react';
import { Masthead } from "./components/Masthead";
import { Calendar } from "./components/Calendar";
import { Footer } from "./components/Footer";
import { ForecastWidget } from "./components/ForecastWidget";
import { getScheduleMessage, validateSchedule, getForecastMessage, loadSchedulesClient } from "@/services/schedule-service";
import type { Schedule } from "@/services/schedule-service";

export default function Home() {
  const currentYear = new Date().getFullYear();
  const today = new Date();
  
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [todayForecasts, setTodayForecasts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Load and validate all schedules
        const schedulesData = await loadSchedulesClient();
        const validatedSchedules = schedulesData.map(s => validateSchedule(s));
        setSchedules(validatedSchedules);

        // Get today's forecasts
        const forecasts = validatedSchedules
          .map(sch => getForecastMessage(today, sch))
          .filter(msg => !!msg);
        setTodayForecasts(forecasts);
      } catch (error) {
        console.error('Failed to load schedule data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadData();
  }, []);

  const getScheduleData = (year: number, month: number, day: number) => {
    const date = new Date(year, month - 1, day);
    return getScheduleMessage(date, schedules);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Masthead />
        <main className="flex-1 px-6 pt-0 pb-12 flex items-center justify-center">
          <div className="text-gray-600 dark:text-gray-400">Loading schedule...</div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Masthead />
      <main className="flex-1 px-6 pt-0 pb-12">
        <ForecastWidget date={today} messages={todayForecasts} getData={getScheduleData} />
        <div className="flex flex-wrap justify-center gap-8 lg:gap-12">
          <div className="w-full lg:w-auto">
            <Calendar year={currentYear} startMonth={1} endMonth={6} getData={getScheduleData} />
          </div>
          <div className="w-full lg:w-auto">
            <Calendar year={currentYear} startMonth={7} endMonth={12} getData={getScheduleData} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
