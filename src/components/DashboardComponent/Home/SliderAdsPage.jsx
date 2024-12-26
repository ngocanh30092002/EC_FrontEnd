import React, { useEffect, useState } from 'react'
import { IMG_URL_BASE } from '~/GlobalConstant.js';

function SliderAdsPage() {
    const [currentIndex, setCurrentIndex] = useState(1);
    const slides = [
        {
            url: IMG_URL_BASE + "ads-1.png"
        },
        {
            url: IMG_URL_BASE + "ads-2.png"
        },
        {
            url: IMG_URL_BASE + "ads-3.png"
        }
    ]

    const prevSlide = () => {
        setCurrentIndex(prev => prev === 0 ? slides.length - 1 : prev - 1);
    }

    const nextSlide = () => {
        setCurrentIndex(prev => prev === slides.length - 1 ? 0 : prev + 1)
    }

    useEffect(() => {
        const autoPlay = setInterval(() => {
            nextSlide();
        }, [3000])


        return () => {
            clearInterval(autoPlay);
        }
    }, [currentIndex])

    return (
        <div className='h-[535px] w-full col-span-12 m-auto relative group'>
            <div style={{ backgroundImage: `url(${slides[currentIndex].url})`, backgroundSize: "cover" }} className='w-full h-full rounded-[8px] bg-center bg-cover duration-500'></div>

            <button className='absolute top-[50%] right-0 translate-y-[-50%] p-[5px] rounded-[50%] bg-white mr-[10px]' onClick={nextSlide}>
                <img src={IMG_URL_BASE + "next-circle-icon.svg"} className='w-[20px] p-[2px]' />
            </button>

            <button className='absolute top-[50%] left-0 translate-y-[-50%] p-[5px] rounded-[50%] bg-white  ml-[10px]' onClick={prevSlide}>
                <img src={IMG_URL_BASE + "previous-circle-icon.svg"} className='w-[20px] p-[2px]' />
            </button>
        </div>
    )
}

export default SliderAdsPage