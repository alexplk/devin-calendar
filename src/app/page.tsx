'use client';

import { Masthead } from "./components/Masthead";
import { Calendar } from "./components/Calendar";
import { Footer } from "./components/Footer";
import { ForecastWidget } from "./components/ForecastWidget";
import { getScheduleMessage, validateSchedule, getForecastMessage } from "@/services/schedule-service";
import schedulesData from "@/assets/schedules.json";

export default function Home() {
  const currentYear = new Date().getFullYear();
  const today = new Date();

  // Validate all schedules
  const schedules = schedulesData.map(s => validateSchedule(s));

  const getScheduleData = (year: number, month: number, day: number) => {
    const date = new Date(year, month - 1, day);
    return getScheduleMessage(date, schedules);
  };

  const todayForecasts = schedules
    .map(sch => getForecastMessage(today, sch))
    .filter(msg => !!msg);

  return (
    <div className="flex min-h-screen flex-col">
      <Masthead />
      <main className="flex-1 px-6 pt-0 pb-12">
        <ForecastWidget date={today} messages={todayForecasts} />
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
