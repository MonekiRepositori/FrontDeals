import React from 'react'
import './error400.css'

const Error400 = () => {
  return (
    <>
        <div class="w-full h-full flex flex-col items-center justify-center">
            <p class="font-helvetica text-center text-5xl font-bold py-24">
                404 NOT FOUND
            </p>
            <div class="relative w-[299px] h-[140px] animate-yay">
                <div class="absolute left-[50px] h-0 w-0 border-b-[195px] border-l-0 border-r-[170px] border-black transform rotate-[41deg]">
                    <div class="absolute w-[170px] h-[30px] top-[160px] shadow-[10px_30px_50px_#000000] animate-yayLeftShadow"></div>
                </div>
                <div class="absolute right-[80px] h-0 w-0 border-b-[195px] border-l-[170px] border-r-0 border-[#242424] transform rotate-[-41deg]">
                    <div class="absolute w-[170px] h-[30px] top-[160px] right-0 shadow-[-10px_30px_50px_#000000] animate-yayRightShadow"></div>
                </div>
            </div>
            <p class="font-helvetica text-center text-5xl font-bold py-24">
                YOU'RE IN A LAND OF MYSTERY
            </p>
        </div>
    </>
  )
}

export default Error400
