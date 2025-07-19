const MetricCard = ({ title, value, unit, bgColor, textColor }) => (
  <div
    className={`relative ${bgColor} rounded-xl shadow-md p-6 overflow-hidden transform transition duration-300 hover:scale-105`}
  >
    <div
      className={`absolute -top-4 -right-4 w-16 h-16 rounded-full opacity-10 ${textColor}`}
    ></div>
    <h3 className="text-lg font-semibold text-gray-600 mb-2">{title}</h3>
    <p className={`text-4xl font-bold ${textColor}`}>
      {value}
      {unit && <span className="text-2xl font-normal ml-1">{unit}</span>}
    </p>
  </div>
);

export default MetricCard