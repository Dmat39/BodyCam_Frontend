
const WeatherCard = ({ temperature, weatherIcon, HR, hora }) => {
    return (
        <div className="w-[250px] h-[278px] px-10 py-4 bg-blue-300 rounded-lg shadow-md flex flex-col items-center justify-center space-y-0 ">
            {/* Ciudad */}
            <h2 className="text-4xl font-semibold text-white ">Lima Este</h2>
            {/* Icono del clima */}
            <img src={`https://www.senamhi.gob.pe/public/images/icono/icon${weatherIcon}.png`} alt="weather icon" className="w-18 h-18" />
            {/* Temperatura */}
            <div className="flex items-baseline space-x-2">
                <span className="text-5xl font-bold text-white">{temperature}</span>
                <span className="text-2xl text-gray-500 text-white">°C</span>
            </div>
            {/* Humedad Relativa */}
            <div className="flex items-baseline space-x-2">
                <span className="text-lg font-bold text-white">HR: {HR}</span>
                <span className="text-lg text-gray-500 text-white">%</span>
            </div>
            {/* HORA */}
            <div className="flex items-baseline space-x-2">
                <span className="text-lg font-bold text-white">{hora}</span>
                <span className="text-lg text-gray-500 text-white"> hrs</span>
            </div>
        </div>
    );
};

export default WeatherCard;