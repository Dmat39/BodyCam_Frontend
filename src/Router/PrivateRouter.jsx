import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';


const PrivateRouter = ({ element }) => {
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);

    return (
        user ? element : <Navigate to="/login" state={{ from: location }} />
    );
}

export default PrivateRouter;