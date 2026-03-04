import React from 'react'
import './loader.css';

const Loader = () => {
  return (
    <>
      <div className="flex flex-col bg-gray-300 items-center justify-center min-h-screen">
        <div className="lds-facebook relative w-20 h-20">
          <div className="block absolute left-2 w-4 bg-current animate-facebook-delay1"></div>
          <div className="block absolute left-8 w-4 bg-current animate-facebook-delay2"></div>
          <div className="block absolute left-14 w-4 bg-current animate-facebook-delay3"></div>
        </div>
        <span className="mt-6 text-3xl animate-pulse">Cargando ... </span>
      </div>
    </>
  )
}

export default Loader;
