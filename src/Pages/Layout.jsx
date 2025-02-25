import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '../Components/Navigation/Sidebar'
import Header from '../Components/Navigation/Header'

const Layout = () => {
    const [toggled, setToggled] = useState(false);

    return (
        <div className='flex h-full'>
            <Sidebar toggled={toggled} setToggled={setToggled} />
            <div className='w-full h-full'>
                <Header toggled={toggled} setToggled={setToggled} />
                <div className='content-body h-full bg-gray-100 p-4 overflow-hidden overflow-y-auto'>
                    <Outlet />
                </div>
            </div>
        </div>
    )
}

export default Layout