const getLevelColor = (nivel) => {
    if (nivel < 75 || isNaN(nivel)) return "bg-blue-500";  // Azul para niveles menores a 75
    if (nivel >= 75 && nivel < 90) return "bg-yellow-300"; // Amarillo para niveles entre 75 y 90
    if (nivel >= 90 && nivel < 120) return "bg-orange-500"; // Naranja para niveles entre 90 y 120
    return "bg-red-600"; // Rojo para niveles mayores a 120
};

const RiverFlowCard = ({ nivel, medida, umbralMaximo, cuerpoAgua }) => {

    const levelColor = getLevelColor(nivel);
    return (
        <div className={`w-[250px] h-[278px] px-10 py-4 ${levelColor} rounded-lg shadow-sm flex flex-col items-center justify-center space-y-0 hover:shadow-2xl transition-shadow duration-300 ease-in-out`}>
            <h2 className="text-3xl font-semibold text-white">{cuerpoAgua}</h2>
            <i className="text-3xl">🌊</i>
            {/* Nivel del caudal */}
            <div className="flex items-center space-x-2 w-full">
                <span className={`text-5xl font-bold  text-white p-2 rounded-lg`}>{nivel}</span>
                <span className="text-xl text-gray-500 text-white">{medida}</span>
            </div>

            {/* Umbral máximo */}
            <div className="w-full rounded-lg p-4">
                <h3 className="text-lg font-medium text-white">Umbral Máximo:</h3>
                <p className="text-gray-600 text-white">{umbralMaximo} {medida}</p>
            </div>
        </div>
    );
};



export default RiverFlowCard;