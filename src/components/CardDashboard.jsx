const CardDashboard = ({ title, value, icon, bgColor }) => {
  return (
    <div
      className={`flex max-w-sm bg-white border border-gray-200 rounded-lg shadow-lg hover:bg-blue-200 mx-auto justify-between`}
    >
      <div className="p-5">
        <h5 className="mb-2 text-lg font-bold tracking-tight text-gray-900">
          {title}
        </h5>
        <h5 className="mb-2 text-lg font-bold tracking-tight text-gray-900">
          {value}
        </h5>
      </div>
      <div
        className={`flex items-center justify-center ${bgColor} rounded-t-lg p-5`}
      >
        {icon}
      </div>
    </div>
  );
};

export default CardDashboard;
