import React, { useState, useEffect, } from 'react'
import { motion } from "framer-motion"
import Logo from '../../assets/logos/logo.png'
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '@mui/material/Button';
import {
    LogOut,
} from "lucide-react"

import { 
    removeToLocalStorage,
    readToLocalStorage,
 } from '../../apis/localStorage';
import { NavBarMenu } from '../../apis/menu';

const NavBar = () => {
    let navigate = useNavigate();
    const location = useLocation();

    const [isExpanded, setIsExpanded] = useState(true);
    const [activeItem, setActiveItem] = useState(location.pathname);
    const [dataMenuUser, setDataMenuUser] = useState([]);

    const onGetAllMenu = () => {
        const userData = readToLocalStorage('user');
        //console.log('data de localStorage => ',userData);
        const menu = NavBarMenu(userData.tipoUsuario)
        //console.log('data de menu => ',menu)
        setDataMenuUser(menu);
    }

    useEffect(() => {
        onGetAllMenu();
    },[])

    return (
        <>
            <div className="flex h-screen bg-white">
                <motion.div
                    initial={false}
                    animate={{ width: isExpanded ? 220 : 80 }}
                    className="bg-blue-600 text-white p-4 flex flex-col shadow-lg"
                >
                    <div className="flex items-center justify-center mb-8">
                        <motion.img
                            src={Logo}
                            alt="Logo"
                            className="w-13 h-13"
                            // animate={{ rotate: isExpanded ? 0 : 360 }}
                            // transition={{ duration: 0.5 }}
                        />
                    </div>

                    {/* // Boton que colapsa menu lateral */}
                    <button
                        className="self-end mb-4 text-white hover:text-blue-200 transition-colors"
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-6 w-6" 
                            fill="none" 
                            viewBox="0 0 24 24" 
                            stroke="currentColor"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M9 5l7 7-7 7" 
                            />
                        </svg>
                    </button>

                    <nav className="space-y-2">
                        {Array.isArray(dataMenuUser) && dataMenuUser.map((item) => (
                            <motion.div
                                key={item.id}
                                whileHover={{ 
                                    scale: 1.02, 
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                                    // backgroundColor: 'rgba(169, 238, 74, 0.1)'
                                    
                                }}
                                className={`rounded-lg cursor-pointer ${
                                activeItem === item.id
                                    ? 'bg-blue-700'
                                    : ''
                                    // : 'hover:bg-blue-500'
                                    // ? 'bg-red-700'
                                    // : 'hover:bg-yellow-500'
                                }`}
                            >
                                <button
                                    onClick={() => {
                                        //console.log('item de menu => ',item)
                                        setActiveItem(location.pathname)
                                        navigate(item.path)                                   
                                    }}
                                    className="flex items-center w-full p-3 rounded-lg transition-colors"
                                >
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        className="h-5 w-5" 
                                        fill="none" 
                                        viewBox="0 0 24 24" 
                                        stroke="currentColor"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d={item.icon} 
                                        />
                                    </svg>
                                    {isExpanded && (
                                        <span className="ml-3 text-sm font-medium">
                                            {item.label}
                                        </span>
                                    )}
                                </button>
                            </motion.div>
                        ))}
                    </nav>

                    <div className="mt-auto">
                        <Button
                            onClick={() => {
                                navigate('/login')
                                removeToLocalStorage('user');
                            }}
                            className="w-full flex items-center p-3 bg-white rounded-lg !text-white hover:bg-blue-500 transition-colors"
                        >
                            <LogOut />
                            {isExpanded && (
                                <span className="ml-3 text-sm font-medium">
                                    Cerrar Sesión
                                </span>
                            )}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </>
    );

}

export default NavBar
