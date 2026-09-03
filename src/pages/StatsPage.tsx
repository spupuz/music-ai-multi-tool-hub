import React, { useState, useEffect } from 'react';
import { ToolProps } from '@/Layout';
import { Line } from 'react-chartjs-2';
import { useCountUp } from '@/hooks/useCountUp';
import '@/components/sunoUserStats/charts/chartSetup';

const AnimatedStat: React.FC<{ value: number }> = ({ value }) => {
  const count = useCountUp(value, 700, true);
  return <>{count.toLocaleString()}</>;
};
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  Sphere, 
  Graticule 
} from "react-simple-maps";
import { scaleSqrt } from "d3-scale";
import Spinner from '@/components/Spinner';
import { countries as countryList } from '@/utils/countryData';
import { 
  UserStatsIcon, 
  BookOpenIcon, 
  SignalIcon, 
  StatsIcon,
  GlobeAltIcon
} from '@/components/Icons';

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const WORKER_URL = 'https://gemini-proxy.spupuz.workers.dev';

const mapCountryNameAliases: Record<string, string> = {
  'United States': 'United States of America',
  'Russian Federation': 'Russia',
  'Czech Republic': 'Czechia',
  'Bosnia and Herzegovina': 'Bosnia and Herz.',
  'Dominican Republic': 'Dominican Rep.',
  'Central African Republic': 'Central African Rep.',
  'Congo, Democratic Republic of the': 'Dem. Rep. Congo',
  'Congo': 'Congo',
  "Korea, Democratic People's Republic of": 'North Korea',
  'Korea, Republic of': 'South Korea',
  "Lao People's Democratic Republic": 'Laos',
  'Syrian Arab Republic': 'Syria',
  'Iran, Islamic Republic of': 'Iran',
  'Moldova, Republic of': 'Moldova',
  'Tanzania, United Republic of': 'Tanzania',
  'Venezuela, Bolivarian Republic of': 'Venezuela',
  'Viet Nam': 'Vietnam',
  'Brunei Darussalam': 'Brunei',
  'North Macedonia': 'Macedonia',
  'Taiwan, Province of China': 'Taiwan',
  'Palestine, State of': 'Palestine',
  'Cape Verde': 'Cabo Verde',
};

const getFlag = (code: string) => {
  const codePoints = code
    .toUpperCase()
    .split('')
    .map(char => 0x1F1E6 + (char.charCodeAt(0) - 'A'.charCodeAt(0)));
  return String.fromCodePoint(...codePoints);
};

const resolveCountryByAlpha2 = (alpha2: string) =>
  countryList.find(c => c.codeAlpha2.toUpperCase() === alpha2.toUpperCase());

const resolveMapCountryName = (alpha2: string) => {
  const country = resolveCountryByAlpha2(alpha2);
  if (!country) return null;
  return mapCountryNameAliases[country.name] || country.name;
};

const StatCard = ({ title, value, sub, icon }: { title: string, value: any, sub: string, icon: React.ReactNode }) => {
  const count = useCountUp(typeof value === 'number' ? value : 0, 800, typeof value === 'number');
  return (
  <div className="glass-card p-6 border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors"></div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className="text-emerald-500">{icon}</div>
      <div className="text-xs font-medium text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full leading-none">{sub}</div>
    </div>
    <div className="text-3xl font-black text-gray-900 dark:text-white leading-none mb-1 tabular-nums relative z-10">{count.toLocaleString()}</div>
    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 relative z-10">{title}</div>
  </div>
  );
};

const StatsPage: React.FC<ToolProps> = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tooltipContent, setTooltipContent] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${WORKER_URL}/stats`);
        if (!res.ok) throw new Error('Failed to fetch stats');
        const data = await res.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="flex justify-center items-center py-24"><Spinner size="w-12 h-12" /></div>;
  if (error) return <div className="text-center py-20 text-red-500 font-semibold">Error: {error}</div>;
  if (!stats) return null;

  const validCountryEntries = Object.entries(stats.countries as Record<string, number>)
    .filter(([alpha2, count]) => count > 0 && alpha2 !== 'XX')
    .map(([alpha2, count]) => {
      const country = resolveCountryByAlpha2(alpha2);
      const mapCountryName = resolveMapCountryName(alpha2);
      return country && mapCountryName
        ? { alpha2, count, country, mapCountryName }
        : null;
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const mapData: Record<string, number> = {};
  validCountryEntries.forEach(({ mapCountryName, count }) => {
    mapData[mapCountryName] = count;
  });

  const maxVisitors = Math.max(...validCountryEntries.map(({ count }) => count), 1);
  const countriesReached = validCountryEntries.length;

  const colorScale = scaleSqrt<string>()
    .domain([1, maxVisitors])
    .range(["#475569", "#10b981"])
    .clamp(true);

  const getCountryFill = (count: number, fallbackColor: string) => {
    if (count <= 0) return fallbackColor;
    return colorScale(count);
  };

  const timelineData = {
    labels: stats.timeline.map((t: any) => t.date),
    datasets: [
      {
        label: 'Unique Visitors',
        data: stats.timeline.map((t: any) => t.uniques),
        borderColor: '#10b981',
        backgroundColor: '#10b98122',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 5,
        pointBackgroundColor: '#10b981',
        borderWidth: 3,
      }
    ]
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fadeIn pb-12">
      <header className="mb-14 text-center pt-8 px-4 animate-fadeIn">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Global Reach • Infrastructure Monitoring
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-1">
        <StatCard title="Unique Visitors" value={stats.total.uniques} sub="All-time" icon={<UserStatsIcon className="w-6 h-6 text-emerald-500" />} />
        <StatCard title="Total Pageviews" value={stats.total.pageviews} sub="All-time" icon={<BookOpenIcon className="w-6 h-6 text-emerald-500" />} />
        <StatCard title="Engagement Status" value={stats.liveCount > 0 ? `${stats.liveCount} Active` : "Online"} sub="Real-time" icon={<SignalIcon className="w-6 h-6 text-emerald-500" />} />
        <StatCard title="Countries Reached" value={countriesReached} sub="Global Scope" icon={<StatsIcon className="w-6 h-6 text-emerald-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 glass-card p-8 border-white/10 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <GlobeAltIcon className="text-emerald-500 w-4 h-4" /> Global Reach
            </h3>
            {tooltipContent && (
               <div className="bg-emerald-600 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-xl animate-pulse whitespace-nowrap">
                 {tooltipContent}
               </div>
            )}
          </div>
          
          <div className="w-full bg-black/10 dark:bg-black/40 rounded-3xl border border-white/5 flex items-center justify-center overflow-hidden relative z-10">
            <ComposableMap width={800} height={400} projectionConfig={{ rotate: [-10, 0, 0], scale: 140 }}>
              <Sphere stroke="#ffffff10" strokeWidth={0.5} id="1" fill="transparent" />
              <Graticule stroke="#ffffff05" strokeWidth={0.3} />
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const countryName = geo.properties.name;
                    const count = mapData[countryName] || 0;
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        onMouseEnter={() => setTooltipContent(`${countryName}: ${count.toLocaleString()} visits`)}
                        onMouseLeave={() => setTooltipContent("")}
                        style={{
                          default: {
                            fill: getCountryFill(count, "#1e293b"),
                            outline: "none",
                            stroke: "#00000030",
                            strokeWidth: 0.3
                          },
                          hover: {
                            fill: "#10b981",
                            outline: "none",
                            cursor: "pointer"
                          },
                          pressed: {
                            fill: "#059669",
                            outline: "none"
                          }
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ComposableMap>
          </div>
          
          <div className="mt-8 flex items-center justify-between relative z-10">
             <div className="text-xs font-medium text-gray-500 dark:text-gray-600">
                Satellite Overview
             </div>
             <div className="flex items-center gap-3 text-xs font-medium text-gray-500 dark:text-gray-400">
                <span>0 Vector</span>
                <div className="w-32 h-1.5 rounded-full bg-slate-800 dark:bg-slate-900 border border-white/5 relative overflow-hidden">
                   <div className="absolute top-0 left-0 h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: '100%' }}></div>
                </div>
                <span>{maxVisitors.toLocaleString()} Peak</span>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 glass-card p-8 border-white/10 shadow-2xl">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-8">Activity Vector Timeline</h3>
          <div className="h-[300px]">
            <Line 
              data={timelineData} 
              options={{ 
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: { 
                    y: { 
                      beginAtZero: true, 
                      grid: { color: 'rgba(255, 255, 255, 0.05)' },
                      ticks: { color: "#64748b", font: { weight: 'bold' as const, size: 9 } }
                    },
                    x: { 
                      grid: { display: false }, 
                      ticks: { color: "#64748b", font: { weight: 'bold' as const, size: 9 } } 
                    }
                }
              }} 
            />
          </div>
        </div>

        <div className="glass-card p-8 border-white/10 shadow-2xl overflow-hidden">
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100 mb-2">Country Access List</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8">
            {countriesReached.toLocaleString()} countries tracked
          </p>
          <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
             {validCountryEntries
               .sort((a, b) => b.count - a.count)
               .map(({ alpha2, count, country }) => {
                 return (
                   <div key={alpha2} className="flex items-center justify-between group py-2 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all duration-300 px-3 -mx-2 rounded-xl">
                     <div className="flex items-center gap-3">
                       <span className="text-lg filter grayscale group-hover:grayscale-0 transition-all duration-300">
                         {country ? getFlag(country.codeAlpha2) : '🏳️'}
                       </span>
                       <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-emerald-500 transition-colors truncate max-w-[140px] leading-none">{country.name}</span>
                     </div>
                     <span className="text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full tabular-nums">{count.toLocaleString()}</span>
                   </div>
                 )
               })
             }
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsPage;
