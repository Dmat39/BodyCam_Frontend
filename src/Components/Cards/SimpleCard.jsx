import { LucideUsers } from "lucide-react";

// Componente reutilizable para tarjetas

const Card = ({ title, total, percentage, icon: Icon }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 flex flex-col gap-2 items-center justify-between w-32 border-black border-2">
      <div>
        <p className="text-xs text-gray-500 uppercase">{title}</p>
        <h2 className="text-2xl font-bold text-center">{total.toLocaleString()}</h2>
        {percentage && (
          <span className="text-sm bg-green-100 text-green-600 font-semibold px-2 py-1 rounded-lg">
            +{percentage}%
          </span>
        )}
      </div>
      <div className="text-gray-300 text-5xl">
        {Icon ? <Icon size={48} /> : <LucideUsers size={48} />}
      </div>
    </div>
  );
};

export default Card;