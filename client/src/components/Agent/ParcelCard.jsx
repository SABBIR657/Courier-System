const ParcelCard = ({ parcel }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 transform transition duration-300 hover:scale-105">
      <h3 className="text-xl font-bold text-gray-800 mb-3">
        Parcel ID: {parcel._id}
      </h3>
      <div className="space-y-2 text-gray-700">
        <p>
          <span className="font-semibold">Customer:</span> {parcel.customer}
        </p>
        <p>
          <span className="font-semibold">Pickup:</span> {parcel.pickupAddress}
        </p>
        <p>
          <span className="font-semibold">Delivery:</span>{" "}
          {parcel.deliveryAddress}
        </p>
        <p>
          <span className="font-semibold">Type:</span> {parcel.parcelType}
        </p>
        <p>
          <span className="font-semibold">Size:</span> {parcel.parcelSize}
        </p>
        <p>
          <span className="font-semibold">Status:</span>{" "}
          <span
            className={`font-bold ${
              parcel.status === "Delivered"
                ? "text-green-600"
                : parcel.status === "Failed"
                ? "text-red-600"
                : "text-blue-600"
            }`}
          >
            {parcel.status}
          </span>
        </p>
        <p>
          <span className="font-semibold">Prepaid:</span>{" "}
          {parcel.isPrepaid ? "Yes" : "No"}
        </p>
        {parcel.codAmount > 0 && (
          <p>
            <span className="font-semibold">COD Amount:</span> ৳
            {parcel.codAmount?.toLocaleString()}
          </p>
        )}
        {parcel.currentLocation && (
          <div className="mt-4">
            <p className="font-semibold mb-2">Current Location:</p>
            <div className="w-full h-48 rounded-md overflow-hidden shadow-md border border-gray-300">
              <iframe
                title={`Parcel ${parcel._id} Location`}
                width="100%"
                height="100%"
                frameBorder="0"
                style={{ border: 0 }}
                src={`https://maps.google.com/maps?q=${parcel.currentLocation.lat},${parcel.currentLocation.lng}&z=15&output=embed`}
                allowFullScreen=""
                aria-hidden="false"
                tabIndex="0"
              ></iframe>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParcelCard;