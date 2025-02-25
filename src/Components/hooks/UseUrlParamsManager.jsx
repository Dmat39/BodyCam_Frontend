import { useLocation, useNavigate } from 'react-router-dom';

const UseUrlParamsManager = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const getParams = () => {
        const url = new URLSearchParams(location.search);
        const params = {};
        url.forEach((value, key) => {
            params[key] = value;
        });
        return params;
    };

    const addParams = (params) => {
        const url = new URLSearchParams(location.search);
        Object.keys(params).forEach(key => {
            url.set(key, params[key]);
        })
        navigate({ search: url.toString() })
    }

    const removeParams = () => {
        const url = new URLSearchParams();
        navigate({ search: url.toString() });
    }
    
    //eliminar solo uno
    const removeParam = (param) => {
        const url = new URLSearchParams(location.search);
        url.delete(param);
        navigate({ search: url.toString() });
    };

    return { getParams, addParams, removeParams, removeParam };
}

export default UseUrlParamsManager