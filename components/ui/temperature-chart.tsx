import { Weather } from "@/lib/types";

export default function TemperatureChart({ weather }: { weather: Weather }) {
    const history = weather.temperatureHistory;
    
    if (!history || history.dates.length === 0) {
      return null;
    }
  
    const temperatures = history.temperatures;
    const maxTemp = Math.max(...temperatures);
    const minTemp = Math.min(...temperatures);
    const range = maxTemp - minTemp || 1;
    const padding = range * 0.1;
    const chartMin = minTemp - padding;
    const chartMax = maxTemp + padding;
    const chartRange = chartMax - chartMin;
  
    const points = temperatures.map((temp, index) => {
      const x = (index / (temperatures.length - 1)) * 100;
      const y = 100 - ((temp - chartMin) / chartRange) * 100;
      return `${x},${y}`;
    });
  
    const linePath = `M ${points.join(' L ')}`;
  
    const areaPath = `M 0,100 L ${points.join(' L ')} L 100,100 Z`;
  
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-l-4 border-l-red-500">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg mr-3">
            <span className="text-2xl">🌡️</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Temperature Trend (7 Days)
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Daily Average in Capital</p>
          </div>
        </div>
        
        <div className="relative w-full h-48 pl-14 pr-2">
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="w-full h-full"
          >
            {/* Gradient for area */}
            <defs>
              <linearGradient id="tempGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgb(239, 68, 68)" stopOpacity="0.3" />
                <stop offset="100%" stopColor="rgb(239, 68, 68)" stopOpacity="0.05" />
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((y) => (
              <line
                key={y}
                x1="0"
                y1={y}
                x2="100"
                y2={y}
                stroke="currentColor"
                strokeWidth="0.2"
                className="text-gray-300 dark:text-gray-600"
                vectorEffect="non-scaling-stroke"
              />
            ))}
            
            {/* Area fill */}
            <path
              d={areaPath}
              fill="url(#tempGradient)"
            />
            
            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke="rgb(239, 68, 68)"
              strokeWidth="0.5"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Data points */}
            {points.map((point, index) => {
              const [x, y] = point.split(',').map(Number);
              return (
                <g key={index}>
                  <circle
                    cx={x}
                    cy={y}
                    r="1"
                    fill="rgb(239, 68, 68)"
                    className="hover:r-2 transition-all"
                    vectorEffect="non-scaling-stroke"
                  />
                </g>
              );
            })}
          </svg>
          
          {/* Y-axis labels */}
          <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-600 dark:text-gray-400 w-12 py-1">
            <span className="text-right">{chartMax.toFixed(1)}°C</span>
            <span className="text-right">{((chartMax + chartMin) / 2).toFixed(1)}°C</span>
            <span className="text-right">{chartMin.toFixed(1)}°C</span>
          </div>
        </div>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2 text-xs text-gray-600 dark:text-gray-400 pl-14 pr-2">
          {history.dates.map((date, index) => {
            // Show only first, middle, and last dates to avoid crowding
            if (index === 0 || index === Math.floor(history.dates.length / 2) || index === history.dates.length - 1) {
              return (
                <span key={index}>
                  {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              );
            }
            return <span key={index} />;
          })}
        </div>
        
        {/* Current temperature highlight */}
        <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Latest Temperature</span>
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">
              {temperatures[temperatures.length - 1].toFixed(1)}°C
            </span>
          </div>
        </div>
      </div>
    );
  }