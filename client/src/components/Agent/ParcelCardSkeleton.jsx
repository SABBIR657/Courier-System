const ParcelCardSkeleton = () => (
  <div className="bg-gray-200 rounded-xl shadow-md p-6 animate-pulse">
    <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-300 rounded w-full"></div>
      <div className="h-4 bg-gray-300 rounded w-5/6"></div>
      <div className="h-4 bg-gray-300 rounded w-full"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
      <div className="h-4 bg-gray-300 rounded w-2/3"></div>
      <div className="h-4 bg-gray-300 rounded w-1/3"></div>
      <div className="h-24 bg-gray-300 rounded w-full mt-4"></div>
    </div>
  </div>
);

export default ParcelCardSkeleton;