const CalculatorIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 14h.01M9 11h.01M12 11h.01M15 11h.01M5 21h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);

const DocumentReportIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const TargetIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const ChartBarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const ShieldCheckIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 20.944a11.955 11.955 0 0118-8.618z" />
    </svg>
);

const DeviceTabletIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
  </svg>
);


const FeatureCard = ({ icon, bgColor, title, description }) => {
  return (
    <div className=" bg-white p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out">
      
      <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${bgColor} mb-4 mx-3 mt-3`}>
        {icon} 
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2 mx-3">{title}</h3> 
      <p className="text-gray-500 leading-relaxed mx-3">{description}</p> 
    </div>
  );
};



export default function Tax() {
  const features = [
    {
      icon: <CalculatorIcon />, 
      bgColor: 'bg-[#F26419]',
      title: 'Accurate Tax Calculations',
      description: 'Precise calculations for capital gains, dividend tax, and other investment-related taxes as per latest Indian tax laws.',
    },
    {
      icon: <DocumentReportIcon />, 
      bgColor: 'bg-[#33658A]',
      title: 'Detailed Tax Reports',
      description: 'Generate comprehensive tax reports with breakdowns, supporting documents, and filing-ready statements.',
    },
    {
      icon: <TargetIcon />,
      bgColor: 'bg-[#F6AE2D]',
      title: 'Tax Optimization',
      description: 'Smart suggestions to minimize your tax liability through legal tax-saving strategies and timing.',
    },
    {
      icon: <ChartBarIcon />, 
      bgColor: 'bg-[#86BBD8]',
      title: 'Portfolio Analysis',
      description: 'Analyze your entire investment portfolio’s tax implications and optimize for better after-tax returns.',
    },
    {
      icon: <ShieldCheckIcon />, 
      bgColor: 'bg-[#2F4858]',
      title: 'Compliance Tracking',
      description: 'Stay compliant with all tax regulations and get alerts for important filing deadlines and changes.',
    },
    {
      icon: <DeviceTabletIcon />, 
      bgColor: 'bg-[#F26419]',
      title: 'Multi-Platform Access',
      description: 'Access your tax calculations and reports from anywhere with our web and mobile applications.',
    },
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-inter">
      <div className="container mx-auto px-4 py-16 sm:py-24">
        
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16 mt-4">
          <h1 className="text-4xl md:text-5xl font-extrabold text-[#33658A] mb-4">
            Complete Tax Management Solution
          </h1>
          <p className="text-lg mb-5 text-[#2F4858]">
            Moneyantra provides comprehensive tax calculation and optimization tools designed specifically for Indian investors and their unique tax requirements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={feature.icon}
              bgColor={feature.bgColor}
              title={feature.title}
              description={feature.description}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
