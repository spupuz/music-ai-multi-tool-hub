import React, { useState, useEffect } from 'react';
import { ToolProps } from '@/Layout';
import { useTheme } from '@/context/ThemeContext';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { 
  ComposableMap, 
  Geographies, 
  Geography, 
  Sphere, 
  Graticule 
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";
import Spinner from '@/components/Spinner';
import { countries as countryList } from '@/utils/countryData';
import { 
  UserStatsIcon, 
  BookOpenIcon, 
  SignalIcon, 
  StatsIcon,
  GlobeAltIcon
} from '@/components/Icons';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const WORKER_URL = 'https://gemini-proxy.spupuz.workers.dev';

const getFlag = (code: string) => {
  const codePoints = code
    .toUpperCase()
    .split('')
    .map(char => 0x1F1E6 + (char.charCodeAt(0) - 'A'.charCodeAt(0)));
  return String.fromCodePoint(...codePoints);
};

const StatCard = ({ title, value, sub, icon }: { title: string, value: any, sub: string, icon: React.ReactNode }) => (
  <div className="glass-card p-6 border-white/10 shadow-xl hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-3xl pointer-events-none group-hover:bg-emerald-500/10 transition-colors"></div>
    <div className="flex justify-between items-start mb-4 relative z-10">
      <div className="text-emerald-500">{icon}</div>
      <div className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full tracking-widest leading-none">{sub}</div>
    </div>
    <div className="text-3xl font-black text-gray-900 dark:text-white leading-none mb-1 tabular-nums relative z-10">{value.toLocaleString()}</div>
    <div className="text-[10px] text-gray-500 dark:text-gray-400 font-black uppercase tracking-widest relative z-10">{title}</div>
  </div>
);

const StatsPage: React.FC<ToolProps> = () => {
  const { uiMode } = useTheme();
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
  if (error) return <div className="text-center py-20 text-red-500 font-bold uppercase tracking-widest">Error: {error}</div>;
  if (!stats) return null;

  const mapData: Record<string, number> = {};
  const maxVisitors = Math.max(...Object.values(stats.countries as Record<string, number>), 1);

  Object.entries(stats.countries as Record<string, number>).forEach(([alpha2, count]) => {
    const country = countryList.find(c => c.codeAlpha2 === alpha2);
    if (country) {
      mapData[country.name] = count;
    }
  });

  const colorScale = scaleLinear<string>()
    .domain([0, maxVisitors])
    .range(["#1e293b", "#10b981"]);

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

  if (uiMode === 'classic') {
    return (
      <div className="w-full text-gray-900 dark:text-white pb-20 px-4 animate-fadeIn">
        <header className="mb-10 text-center pt-8">
          <h1 className="text-2xl md:text-3xl font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
            Analytics
          </h1>
          <p className="mt-3 text-sm font-medium text-gray-700 dark:text-gray-300 max-w-3xl mx-auto text-center">
            Hub-wide engagement and global reach metrics
          </p>
        </header>

        <main className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Unique Visitors", value: stats.total.uniques, icon: <UserStatsIcon className="w-6 h-6 text-emerald-600" /> },
              { title: "Total Pageviews", value: stats.total.pageviews, icon: <BookOpenIcon className="w-6 h-6 text-emerald-600" /> },
              { title: "Engagement", value: stats.liveCount > 0 ? `${stats.liveCount} Online` : "Streaming", icon: <SignalIcon className="w-6 h-6 text-emerald-600" /> },
              { title: "Countries", value: Object.keys(stats.countries).length, icon: <StatsIcon className="w-6 h-6 text-emerald-600" /> }
            ].map((stat, idx) => (
              <div key={idx} className="glass-card p-6 border-2 border-emerald-600/50 dark:border-emerald-500/30 flex flex-col items-center shadow-sm">
                <div className="mb-3">{stat.icon}</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white tabular-nums">{stat.value.toLocaleString()}</div>
                <div className="text-xs text-gray-500 font-bold uppercase tracking-widest">{stat.title}</div>
              </div>
            ))}
          </div>

          <div className="glass-card p-8 border border-gray-100 dark:border-gray-800 relative shadow-sm">
             <div className="flex items-center justify-between mb-8">
               <h3 className="text-xs font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 flex items-center gap-2">
                 <GlobeAltIcon className="text-emerald-600 w-4 h-4" /> Global Deployment Reach
               </h3>
               {tooltipContent && (
                  <div className="bg-emerald-600 text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse whitespace-nowrap">
                    {tooltipContent}
                  </div>
               )}
             </div>
             
             <div className="w-full bg-gray-50 dark:bg-black/20 rounded-xl border border-gray-100 dark:border-gray-800 flex items-center justify-center overflow-hidden">
               <ComposableMap width={800} height={400} projectionConfig={{ rotate: [-10, 0, 0], scale: 140 }}>
                 <Sphere stroke="#00000010" strokeWidth={0.5} id="1" fill="transparent" />
                 <Graticule stroke="#00000005" strokeWidth={0.3} />
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
                               fill: count > 0 ? colorScale(count) : (document.documentElement.classList.contains('dark') ? "#1e293b" : "#e2e8f0"),
                               outline: "none",
                               stroke: "#00000020",
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
             <div className="mt-6 flex items-center justify-between">
                 <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Satellite Overview
                 </div>
                 <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    <span>0 Vector</span>
                    <div className="w-32 h-1.5 rounded-full bg-gray-200 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                       <div className="absolute top-0 left-0 h-full bg-emerald-500 shadow-[0_0_8px_#10b981]" style={{ width: '100%' }}></div>
                    </div>
                    <span>{maxVisitors.toLocaleString()} Peak</span>
                 </div>
              </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 glass-card p-6 border border-gray-100 dark:border-gray-800 shadow-inner">
               <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-6 flex justify-between items-center px-1">
                  <span className="uppercase tracking-widest text-xs">Activity Timeline</span>
                  <span className="text-[10px] font-normal text-gray-400 italic uppercase">Last 30 days</span>
               </h3>
               <div className="h-[300px]">
                  <Line 
                    data={timelineData} 
                    options={{ 
                      maintainAspectRatio: false,
                      plugins: { legend: { display: false } },
                      scales: { 
                          y: { 
                            beginAtZero: true, 
                            grid: { color: 'rgba(16, 185, 129, 0.05)' },
                            ticks: { color: "#64748b", font: { weight: 'bold' as const, size: 10 } }
                          },
                          x: { 
                            grid: { display: false }, 
                            ticks: { color: "#64748b", font: { weight: 'bold' as const, size: 10 } } 
                          }
                      }
                    }} 
                  />
               </div>
            </div>

            <div className="glass-card p-6 border border-gray-100 dark:border-gray-800 shadow-inner">
               <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-6">Top Regions</h3>
               <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                 {Object.entries(stats.countries as Record<string, number>)
                   .sort((a,b) => b[1] - a[1])
                   .slice(0, 15)
                   .map(([code, count]) => {
                     const country = countryList.find(c => c.codeAlpha2 === code);
                     return (
                       <div key={code} className="flex items-center justify-between p-2 bg-gray-50/50 dark:bg-gray-800/30 rounded border border-gray-100/50 dark:border-gray-700/50 tabular-nums">
                         <div className="flex items-center gap-3">
                           <span>{country ? getFlag(country.codeAlpha2) : '🏳️'}</span>
                           <span className="text-xs font-bold truncate max-w-[120px] tracking-tight uppercase">{country?.name || code}</span>
                         </div>
                         <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">{count.toLocaleString()}</span>
                       </div>
                     )
                   })
                 }
               </div>
            </div>
          </div>
        </main>

        <footer className="mt-16 pt-8 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-sm text-gray-500">Music AI Multi-Tool Hub &copy; {new Date().getFullYear()}</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-fadeIn pb-12">
      <header className="mb-14 text-center pt-8 px-4 animate-fadeIn">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-emerald-600 dark:text-emerald-500 leading-none italic mb-4">Analytics</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500 dark:text-gray-400 max-w-xl mx-auto opacity-70">
            Neural Infrastructure Monitoring • Global Deployment Reach
        </p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-1">
        <StatCard title="Unique Visitors" value={stats.total.uniques} sub="All-time" icon={<UserStatsIcon className="w-6 h-6 text-emerald-500" />} />
        <StatCard title="Total Pageviews" value={stats.total.pageviews} sub="All-time" icon={<BookOpenIcon className="w-6 h-6 text-emerald-500" />} />
        <StatCard title="Engagement Status" value={stats.liveCount > 0 ? `${stats.liveCount} Active` : "Online"} sub="Real-time" icon={<SignalIcon className="w-6 h-6 text-emerald-500" />} />
        <StatCard title="Countries Reached" value={Object.keys(stats.countries).length} sub="Global Scope" icon={<StatsIcon className="w-6 h-6 text-emerald-500" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 glass-card p-8 border-white/10 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[120px] pointer-events-none"></div>
          <div className="flex items-center justify-between mb-8 relative z-10">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-800 dark:text-gray-100 flex items-center gap-2">
              <GlobeAltIcon className="text-emerald-500 w-4 h-4" /> Global Deployment Reach
            </h3>
            {tooltipContent && (
               <div className="bg-emerald-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl animate-pulse whitespace-nowrap">
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
                            fill: count > 0 ? colorScale(count) : "#1e293b",
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
             <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-600">
                Satellite Overview
             </div>
             <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400">
                <span>0 Vector</span>
                <div className="w-32 h-1.5 rounded-full bg-slate-800 dark:bg-slate-900 border border-white/5 relative overflow-hidden">
                   <div className="absolute top-0 left-0 h-full bg-emerald-500 shadow-[0_0_10px_#10b981]" style={{ width: '100%' }}></div>
                </div>
                <span>{maxVisitors.toLocaleString()} Peak</span>
             </div>
          </div>
        </div>

        <div className="lg:col-span-2 glass-card p-8 border-white/10 shadow-2xl">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-800 dark:text-gray-100 mb-8">Activity Vector Timeline</h3>
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
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-800 dark:text-gray-100 mb-8">Top Node Regions</h3>
          <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
             {Object.entries(stats.countries as Record<string, number>)
               .sort((a,b) => b[1] - a[1])
               .slice(0, 15)
               .map(([code, count]) => {
                 const country = countryList.find(c => c.codeAlpha2 === code);
                 return (
                   <div key={code} className="flex items-center justify-between group py-2 border-b border-white/5 last:border-0 hover:bg-white/5 transition-all duration-300 px-3 -mx-2 rounded-xl">
                     <div className="flex items-center gap-3">
                       <span className="text-lg filter grayscale group-hover:grayscale-0 transition-all duration-300">
                         {country ? getFlag(country.codeAlpha2) : '🏳️'}
                       </span>
                       <span className="text-[11px] font-black uppercase tracking-tight text-gray-600 dark:text-gray-400 group-hover:text-emerald-500 transition-colors truncate max-w-[140px] leading-none">{country?.name || code}</span>
                     </div>
                     <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full tabular-nums">{count.toLocaleString()}</span>
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
