import React, {useEffect, useState } from 'react'
import User from '../../assets/icon/user-1-pre.png'
import { readToLocalStorage } from '../../apis/localStorage';
import { 
    Clock,
    Calendar,
} from 'lucide-react';

const Head = () => {
    const [time, setTime] = useState(new Date())
    const [date, setDate] = useState(new Date())
    const [dataUser, setDataUser] = useState('')

    const onAnimateClock = () => {
        return (
            <div className="flex items-center justify-center space-x-2 bg-gradient-to-r p-2">
              <Clock className="w-5 h-5 text-white animate-pulse" />
              <div className="text-xl font-bold text-white font-mono">
                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </div>
            </div>
        );
    };

    const onAnimateClockDate = () => {
        return (
            <div className="flex items-center justify-center space-x-2 bg-gradient-to-r p-2">
                <Calendar className="w-5 h-5 text-white animate-pulse" />
                <div className="text-xl text-white font-mono">
                {date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
            </div>
        );
    };

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000)
        return () => clearInterval(timer)
    },[]);

    useEffect(() => {
        const timer = setInterval(() => setDate(new Date()), 1000)
        return () => clearInterval(timer)
    },[]);

    const onGetDataUser = async () => {
        try {
            const response = await readToLocalStorage('user');
            setDataUser(response)
        } catch (error) {
            throw error
        }
    };

    useEffect(() => {
        onGetDataUser();
    },[])

    return (
        <>
            <header className="bg-blue-500 text-white py-4 top-0 sticky z-50">
                <nav className="container mx-auto flex">
                    <div className='flex flex-row'>
                        <div className="w-96 flex justify-center space-x-4">
                            {onAnimateClock()}
                        </div>

                        <div className="w-64 flex justify-center space-x-4">
                            {onAnimateClockDate()}
                        </div>
                    </div>
                    <div className="container mx-auto flex justify-end items-center gap-4 px-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-100">
                            <img src={User} alt="User Avatar" className="p-1 w-full h-full object-cover" />
                        </div>
                        <div className='flex flex-col'>
                        <span className="text-lg font-semibold flex justify-center">
                            {`${dataUser.firstName} ${dataUser.lastNamePaternal}`}
                        </span>
                        <span className="text-lg font-semibold">
                            {`Tipo Usuario: ${dataUser.username}`}
                        </span>
                        </div>
                    </div>                   
                </nav>
            </header>
        </>
    )
}

export default Head
