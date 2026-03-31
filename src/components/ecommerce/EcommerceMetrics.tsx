/* eslint-disable @typescript-eslint/no-explicit-any */
import { BoxIconLine } from "../../icons";
import { useState, useEffect } from "react";
import { getDashboardApi } from "../../api/dashboardAPI";
import toast from "react-hot-toast";
import { MdOutlineCategory } from "react-icons/md";
import { MdOutlineDashboard } from "react-icons/md";
import { LuPalette } from "react-icons/lu";
import { BsCalendar4Event } from "react-icons/bs";
import { HiOutlineUsers } from "react-icons/hi";
import { FaWpforms } from "react-icons/fa6";

type DashboardStats = {
  artists: number;
  categories: number;
  artTypes: number;
  events: number;
  contributions: number;
  applications: {
    artForms: number;
    events: number;
  };
};

export default function EcommerceMetrics() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await getDashboardApi();
      setStats(res.data);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const metrics = stats
    ? [
      {
        label: "Total Artists",
        value: stats.artists,
        icon: <MdOutlineDashboard className="w-4 h-4 sm:w-5 sm:h-5" />,
        color: "#893128",
        bgColor: "bg-[#893128]",
        iconColor: "text-white",
      },
      {
        label: "Total Categories",
        value: stats.categories,
        icon: <MdOutlineCategory className="w-4 h-4 sm:w-5 sm:h-5" />,
        color: "#893128",
        bgColor: "bg-[#893128]",
        iconColor: "text-white",
      },
      {
        label: "Total Art Types",
        value: stats.artTypes,
        icon: <LuPalette className="w-4 h-4 sm:w-5 sm:h-5" />,
        color: "#893128",
        bgColor: "bg-[#893128]",
        iconColor: "text-white",
      },
      {
        label: "Total Events",
        value: stats.events,
        icon: <BsCalendar4Event className="w-4 h-4 sm:w-5 sm:h-5" />,
        color: "#893128",
        bgColor: "bg-[#893128]",
        iconColor: "text-white",
      },
      {
        label: "Total Contributions",
        value: stats.contributions,
        icon: <HiOutlineUsers className="w-4 h-4 sm:w-5 sm:h-5" />,
        color: "#893128",
        bgColor: "bg-[#893128]",
        iconColor: "text-white",
      },
      {
        label: "Registrations",
        value: stats.applications,
        icon: <FaWpforms className="w-4 h-4 sm:w-5 sm:h-5" />,
        color: "#893128",
        bgColor: "bg-[#893128]",
        iconColor: "text-white",
      },
    ]
    : [];

  return (
    <div className="min-h-screen px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header - Responsive */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm md:text-base text-gray-600">
            Monitor your platform's key metrics at a glance
          </p>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-12 sm:py-16 md:py-20">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 border-3 sm:border-4 border-gray-200 border-t-[#893128] mb-3 sm:mb-4"></div>
              <p className="text-xs sm:text-sm md:text-base text-gray-600 font-medium">Loading dashboard...</p>
            </div>
          </div>
        )}

        {!loading && stats && (
          /* Metrics Grid - Responsive */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {metrics.map((metric, index) => (
              <div
                key={metric.label}
                className="bg-white rounded-lg sm:rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden group"
                style={{
                  animation: `fadeInUp 0.5s ease-out ${index * 0.1}s both`,
                }}>
                {/* Colored Top Bar */}
                <div
                  className="h-1.5 sm:h-2"
                  style={{ background: metric.color }}></div>

                {/* Card Content - Responsive */}
                <div className="p-4 sm:p-5 md:p-6">
                  <div className="flex items-start justify-between mb-3 sm:mb-4">
                    {/* Icon Container */}
                    <div
                      className={`${metric.bgColor} p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl group-hover:scale-110 transition-transform duration-300`}>
                      <div className={metric.iconColor}>{metric.icon}</div>
                    </div>

                    {/* Value Container */}
                    <div className="text-right">
                      <p className="text-[10px] sm:text-xs md:text-sm font-medium text-gray-500 mb-0.5 sm:mb-1">
                        {metric.label}
                      </p>

                      {metric.label === "Registrations" ? (
                        /* Registrations Split View - Responsive */
                        <div className="flex items-center gap-2 sm:gap-3 md:gap-4 mt-1 sm:mt-2">
                          {/* Art Form Registrations */}
                          <div className="text-left">
                            <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 whitespace-nowrap">Art Form</p>
                            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-amber-900">
                              {stats.applications.artForms}
                            </p>
                          </div>

                          {/* Vertical Divider */}
                          <div className="h-8 sm:h-10 w-px bg-gray-200"></div>

                          {/* Event Registrations */}
                          <div className="text-right">
                            <p className="text-[8px] sm:text-[10px] md:text-xs text-gray-500 whitespace-nowrap">Events</p>
                            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-amber-900">
                              {stats.applications.events}
                            </p>
                          </div>
                        </div>
                      ) : (
                        /* Single Value Display */
                        <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-amber-900">
                          {Number(metric.value || 0).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Footer with Refresh Button - Responsive */}
                  <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 md:pt-4 border-t border-gray-100 flex justify-end">
                    <button
                      onClick={loadDashboard}
                      className="text-[10px] sm:text-xs md:text-sm text-amber-900 font-medium hover:text-amber-700 transition-colors">
                      Refresh
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !stats && (
          /* Empty State - Responsive */
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm p-6 sm:p-8 md:p-10 lg:p-12 text-center">
            <div className="text-gray-400 mb-3 sm:mb-4">
              <BoxIconLine className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto" />
            </div>
            <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">No data available</p>
            <button
              onClick={loadDashboard}
              className="px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 bg-amber-600 text-white rounded-lg text-xs sm:text-sm md:text-base hover:bg-amber-700 transition-colors">
              Retry
            </button>
          </div>
        )}
      </div>

    </div>
  );
}