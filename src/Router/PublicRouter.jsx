
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, useLocation } from 'react-router-dom';

const PublicRouter = ({ element }) => {
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);
    const  previusURL = location.state?.from.pathname || "/";
    
    return (
        !user ? element : <Navigate to={previusURL} />
    );
}

export default PublicRouter;