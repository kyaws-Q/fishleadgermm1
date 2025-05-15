import { SpendingChart } from "@/components/SpendingChart";

export default function AnalyticsPage() {
  return (
    <div className="bg-[#f6f7f9] min-h-screen w-full pb-8">
      <div className="max-w-6xl mx-auto w-full px-2 sm:px-4 md:px-6 pt-6">
        {/* Header Card */}
        <div className="bg-white px-6 py-4 border border-gray-100 rounded-2xl shadow-xl flex flex-col gap-2 mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 font-sans leading-tight">Financial Analytics</h1>
          <p className="mt-0.5 text-gray-500 text-base font-sans">Comprehensive analysis of your seafood procurement data</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <SpendingChart 
            title="Species Distribution" 
            description="Breakdown of expenditure by fish species"
            type="bar" 
          />
          <SpendingChart 
            title="Cost Allocation" 
            description="Overall spending distribution across categories"
            type="pie" 
          />
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 mb-8">
          <SpendingChart 
            title="Financial Trends" 
            description="Monthly procurement expenditure analysis"
            type="line" 
          />
        </div>
      </div>
    </div>
  );
}
