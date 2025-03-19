import React from 'react'
import PrivateRouter from './PrivateRouter';
import PublicRouter from './PublicRouter';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import Layout from '../Pages/Layout';
import ControlBodycam from '../Pages/ControlBody/Controlbodycam';
import BaseDatos from '../Pages/BaseDeDatos/Base_Datos';
import Dashboard from '../Pages/Dashboard';

const AppRouter = () => {
    const router = createBrowserRouter([
        {
            path: "/",
            element: <PrivateRouter element={<Layout />} />,
            children: [
                {
                    path: "/",
                    element: <PrivateRouter element={<Dashboard />} />,
                },
                {
                    path: "/control_bodycam",
                    element: <PrivateRouter element={<ControlBodycam />} />,
                },
                {
                    path: "/base_datos",
                    element: <PrivateRouter element={<BaseDatos />} />,
                },
            ]
        },
        
        // {
        //     path: "/login",
        //     element: <PublicRouter element={<Login />} />,
        // },
        // {
        //     path: "/registro",
        //     element: <PublicRouter element={<Register />} />,
        // },

    ]);

    return (
        <RouterProvider router={router} />
    )
}

export default AppRouter