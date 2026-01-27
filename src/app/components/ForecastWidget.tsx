import { Schedule } from '@/services/schedule-service';

interface ForecastWidgetProps {
  date: Date;
  messages: string[];
}

export function ForecastWidget({ date, messages }: ForecastWidgetProps) {
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

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
      </div>
    </section>
  );
}
