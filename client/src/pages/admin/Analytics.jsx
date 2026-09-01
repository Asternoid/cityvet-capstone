import React, { useState } from 'react';
import AdminLayout from '../../components/common/AdminLayout';
import useAdminData from '../../hooks/useAdminData';
import { 
  PieChart, 
  LineChart,
  List,
  BarChart3
} from 'lucide-react';

export default function Analytics() {
  const [activeTab, setActiveTab] = useState('sentiment');

  const { data: analyticsData, loading, error } = useAdminData('/admin/analytics');
  const feedbackTotal = analyticsData?.totalFeedback || 0;
  const positivePercent = feedbackTotal ? Math.round(((analyticsData.sentiment?.positive || 0) / feedbackTotal) * 100) : 0;

  // Top Stats (Generic Empty Data)
  const topStats = [
    { label: 'Positive Feedback', value: `${positivePercent}%`, sub: `${feedbackTotal} responses`, color: 'text-emerald-700', bg: 'bg-emerald-50/50 border-emerald-200' },
    { label: 'Avg. Satisfaction Score', value: 'N/A', sub: 'Not scored in feedback schema', color: 'text-sky-700', bg: 'bg-sky-50/50 border-sky-200' },
    { label: 'Top Theme', value: analyticsData?.themes?.[0]?.theme || 'No Data', sub: `${analyticsData?.themes?.[0]?.count || 0} mentions`, color: 'text-amber-700', bg: 'bg-amber-50/50 border-amber-200' },
  ];

  // Tabs Configuration
  const tabs = [
    { id: 'sentiment', label: 'Sentiment Analysis', icon: PieChart },
    { id: 'themes', label: 'Recurring Themes', icon: List },
    { id: 'trends', label: 'Satisfaction Trends', icon: LineChart },
  ];

  // Skeleton Components (inline) - matching AdminDashboard exactly
  const SkeletonStatCard = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
      <div className="skeleton h-4 w-24 mb-3" />
      <div className="skeleton h-8 w-16 mb-2" />
      <div className="skeleton h-3 w-20" />
    </div>
  );

  const SkeletonTabContent = () => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 flex flex-col min-h-[350px]">
      <div className="skeleton h-6 w-48 mb-4" />
      <div className="flex-1 space-y-4">
        <div className="skeleton h-32 w-full" />
        <div className="skeleton h-32 w-full" />
      </div>
    </div>
  );

  const SkeletonAlertSection = () => (
    <section className="bg-red-50/50 border border-red-200 rounded-xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4 gap-2 sm:gap-4">
        <div>
          <div className="skeleton h-5 w-56 mb-1" />
          <div className="skeleton h-4 w-48" />
        </div>
      </div>
      <div className="bg-white/80 rounded-lg p-6 sm:p-8 flex flex-col items-center justify-center text-center border border-red-100/50">
        <div className="skeleton h-4 w-64" />
      </div>
    </section>
  );

  return (
    <AdminLayout pageTitle="Analytics">
      <div className="p-4 sm:p-6 lg:p-8">
          
          {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

          {/* --- SKELETON LOADING STATE --- */}
          {loading ? (
            <>
              {/* Stats Skeleton */}
              <section className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {[...Array(3)].map((_, i) => (
                  <SkeletonStatCard key={i} />
                ))}
              </section>

              {/* Tabs Skeleton */}
              <div className="border-b border-slate-200 mb-8 px-1">
                <div className="flex gap-8">
                  {tabs.map((tab) => (
                    <div key={tab.id} className="skeleton h-8 w-32" />
                  ))}
                </div>
              </div>

              {/* Main Content Skeleton */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6 sm:mb-8">
                <SkeletonTabContent />
                <SkeletonTabContent />
              </div>

              {/* Alert Section Skeleton */}
              <SkeletonAlertSection />
            </>
          ) : (
            /* --- ACTUAL CONTENT --- */
            <>
              {/* TOP STATS ROW */}
              <section className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
                {topStats.map((stat, idx) => (
                  <div key={idx} className={`${stat.bg} rounded-xl px-4 sm:px-6 py-4 sm:py-5 shadow-sm border skeleton-fade-in`}>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 mb-1">{stat.label}</p>
                    <p className={`text-xl sm:text-2xl font-bold ${stat.color} mb-0.5`}>{stat.value}</p>
                    <p className="text-[10px] sm:text-xs text-slate-400">{stat.sub}</p>
                  </div>
                ))}
              </section>

              {/* TABS NAVIGATION */}
              <div className="border-b border-slate-200 mb-8 px-1">
                <div className="flex gap-4 sm:gap-8 overflow-x-auto">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex items-center gap-2 pb-4 pt-1 text-sm font-medium transition-colors relative border-b-2 whitespace-nowrap
                        ${activeTab === tab.id 
                          ? 'border-emerald-700 text-emerald-700'
                          : 'border-transparent text-slate-500 hover:text-slate-700'
                        }
                      `}
                    >
                      <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? 'text-emerald-700' : 'text-slate-400'}`} />
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* === TAB CONTENT RENDERER === */}
              <div className="min-h-[400px]">
                
                {/* --- SENTIMENT ANALYSIS TAB --- */}
                {activeTab === 'sentiment' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 skeleton-fade-in">
                    {/* Donut Chart (Custom CSS Conic Gradient) */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 flex flex-col items-center justify-center text-center min-h-[350px]">
                      <h4 className="font-semibold text-slate-800 mb-1">August 2025 Sentiment</h4>
                      <p className="text-xs text-slate-400 mb-8">Distribution of client feedback sentiment</p>
                      
                      {/* CSS Donut Chart (78%, 15%, 7%) */}
                      <div className="relative w-40 sm:w-48 h-40 sm:h-48 rounded-full" 
                           style={{ background: 'conic-gradient(#166534 0% 78%, #0F766E 78% 93%, #DC2626 93% 100%)' }}>
                        <div className="absolute inset-0 m-5 bg-white rounded-full flex items-center justify-center">
                          <div className="text-center">
                            <p className="text-xl font-bold text-emerald-900">No Data</p>
                            <p className="text-[10px] text-slate-400">Live charts pending</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Legend */}
                      <div className="mt-8 w-full max-w-xs flex justify-between text-xs font-medium">
                        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#166534] rounded-sm"></span> Positive <span className="text-[#166534]">0%</span></div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#0F766E] rounded-sm"></span> Neutral <span className="text-[#0F766E]">0%</span></div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 bg-[#DC2626] rounded-sm"></span> Negative <span className="text-[#DC2626]">0%</span></div>
                      </div>
                    </div>

                    {/* Bar Chart (Custom Flexbox) */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6">
                      <h4 className="font-semibold text-slate-800 mb-1">Sentiment by Month</h4>
                      <p className="text-xs text-slate-400 mb-6">Mar – Aug 2025 • NLP-analyzed client feedback responses</p>
                      
                      <div className="h-64 flex items-end justify-between gap-2 px-2 pt-4">
                        {['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'].map((m, i) => (
                          <div key={m} className="flex flex-col items-center gap-2 flex-1 h-full justify-end">
                             {/* Stacked bars representation */}
                             <div className="w-3 bg-[#DC2626] rounded-sm h-[10%]"></div>
                             <div className="w-3 bg-[#0F766E] rounded-sm h-[20%]"></div>
                             <div className="w-3 bg-[#166534] rounded-sm h-[60%]"></div>
                             <p className="text-xs text-slate-500 mt-2">{m}</p>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 flex justify-end gap-4 text-xs font-medium">
                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#DC2626] rounded-sm"></span> Negative</div>
                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#0F766E] rounded-sm"></span> Neutral</div>
                        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-[#166534] rounded-sm"></span> Positive</div>
                      </div>
                    </div>
                    
                    {/* Footer Note */}
                    <div className="lg:col-span-2 bg-sky-50/50 border border-sky-200 rounded-lg p-4 flex items-start gap-2 text-xs text-sky-700">
                      <span className="font-medium">Note:</span> Sentiment analysis is performed using NLP on submitted client feedback text. Categories are Positive, Neutral, and Negative. NLP is used exclusively for feedback analytics — not for veterinary advice or animal diagnosis.
                    </div>
                  </div>
                )}

                {/* --- RECURRING THEMES TAB --- */}
                {activeTab === 'themes' && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden skeleton-fade-in">
                    {/* Empty State / Placeholder Table */}
                    <div className="p-12 flex flex-col items-center justify-center text-center min-h-[350px]">
                      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4 text-slate-300">
                        <BarChart3 className="w-8 h-8" />
                      </div>
                      <h4 className="text-lg font-semibold text-slate-700">No recurring themes tracked</h4>
                      <p className="text-sm text-slate-400 max-w-sm mt-1">
                        Client feedback topics, categories, and sentiment mapping will populate this table once feedback is collected.
                      </p>
                    </div>
                    
                    {/* 
                      * BACKEND INTEGRATION NOTE:
                      * Replace the Empty State above with this table when ready:
                      * <table className="w-full text-sm text-left">
                      *   <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                      *     <tr><th className="px-6 py-3 font-medium">#</th><th className="px-6 py-3 font-medium">THEME</th><th className="px-6 py-3 font-medium">FEEDBACK CATEGORY</th><th className="px-6 py-3 font-medium">FREQUENCY</th><th className="px-6 py-3 font-medium">SENTIMENT</th></tr>
                      *   </thead>
                      *   <tbody className="divide-y divide-slate-100">
                      *      {themes.map(item => <tr>...</tr>)}
                      *   </tbody>
                      * </table>
                      */}
                  </div>
                )}

                {/* --- SATISFACTION TRENDS TAB --- */}
                {activeTab === 'trends' && (
                  <div className="space-y-6 skeleton-fade-in">
                    {/* Line Chart (Custom SVG) */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sm:p-6 relative">
                      <h4 className="font-semibold text-slate-800 mb-1">Service Satisfaction Trend</h4>
                      <p className="text-xs text-slate-400 mb-6">Average client satisfaction score (out of 5.0) — Mar to Aug 2025</p>
                      
                      <div className="h-64 w-full relative">
                        {/* Grid Lines */}
                        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                          {[5.0, 4.5, 4.0, 3.5, 3.0].map((val) => (
                            <div key={val} className="border-t border-slate-100 w-full flex items-center text-[10px] text-slate-300">
                              <span className="absolute -left-8">{val}</span>
                            </div>
                          ))}
                        </div>
                        
                        {/* Interactive Tooltip Element (Visual Demo) */}
                        <div className="absolute top-1/2 right-1/4 bg-white shadow-lg border border-slate-200 rounded p-2 text-[10px] z-10 pointer-events-none -translate-y-14">
                          <p className="font-bold text-slate-700">Apr</p>
                          <p className="text-slate-500">Avg. Satisfaction : 4.0 / 5.0</p>
                        </div>

                        {/* SVG Line Drawing */}
                        <svg className="w-full h-full absolute inset-0" preserveAspectRatio="none">
                          <defs>
                            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#166534" stopOpacity="0.15" />
                              <stop offset="100%" stopColor="#166534" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          {/* The Line */}
                          <path 
                            d="M 5% 70% Q 20% 60%, 35% 55% T 65% 60% T 95% 30%"
                            fill="none" 
                            stroke="#166534" 
                            strokeWidth="3"
                            strokeLinecap="round"
                          />
                          {/* The Dots */}
                          <circle cx="5%" cy="70%" r="4" fill="#166534" />
                          <circle cx="35%" cy="55%" r="5" fill="#FBBF24" stroke="#166534" strokeWidth="2" /> {/* Highlighted Active */}
                          <circle cx="50%" cy="50%" r="4" fill="#166534" />
                          <circle cx="65%" cy="60%" r="4" fill="#166534" />
                          <circle cx="80%" cy="40%" r="4" fill="#166534" />
                          <circle cx="95%" cy="30%" r="4" fill="#166534" />
                        </svg>

                        {/* X-Axis Labels */}
                        <div className="absolute bottom-0 w-full flex justify-between text-xs text-slate-400 pt-4 border-t border-slate-100">
                          <span>Mar</span>
                          <span>Apr</span>
                          <span>May</span>
                          <span>Jun</span>
                          <span>Jul</span>
                          <span>Aug</span>
                        </div>
                      </div>
                    </div>

                    {/* Trend Bottom Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {['Jun 2025', 'Jul 2025', 'Aug 2025'].map((month, idx) => (
                        <div key={month} className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                          <p className="text-xs text-slate-400 mb-2">{month}</p>
                          <p className="text-2xl font-bold text-emerald-900 mb-1">0.0</p>
                          <p className="text-xs text-slate-500">/ 5.0 satisfaction</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </>
          )}

        </div>

        {/* Add global styles for skeleton loading */}
        <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        .skeleton {
          background: #e2e8f0;
          background: linear-gradient(
            90deg,
            #e2e8f0 0%,
            #f1f5f9 40%,
            #e2e8f0 80%
          );
          background-size: 200% 100%;
          animation: shimmer 1.5s ease-in-out infinite;
          border-radius: 0.25rem;
          min-height: 0.75rem;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .skeleton-fade-in {
          animation: fadeIn 0.3s ease-in-out;
        }

        /* Responsive skeleton adjustments */
        @media (max-width: 640px) {
          .skeleton {
            min-height: 0.625rem;
          }
        }
      `}</style>
    </AdminLayout>
  );
}