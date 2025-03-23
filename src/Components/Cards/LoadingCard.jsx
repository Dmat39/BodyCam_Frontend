import Logo from "../../assets/logos/logo_sjl.png";

const LoadingCard = () => {
    return (
        <div className="w-[250px] h-[278px] px-10 py-4 bg-white rounded-lg shadow-xl shadow-gray-500 flex flex-col items-center justify-center space-y-0">
           <img src={Logo} className="animate-pulse" />
           <p className="font-bold text-sm animate-pulse">Cargando Informacion...</p>
        </div>
    );
}

export default LoadingCard;