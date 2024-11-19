import React from 'react'
import { IMG_URL_BASE } from '~/GlobalConstant.js';

function ToeicNowItem({onShowHistory}) {
    const handleShowHistory = ()=>{
        onShowHistory(true);
    }
    return (
        <div className='grid grid-cols-12 w-full toeic-time__wrapper items-center h-[200px] overflow-visible'>
            <div className='tt__left-container col-span-3 flex items-center justify-center'>
            </div>
            <div className='flex justify-center h-full relative overflow-visible'>
                <div className='tt__timeline'>
                    <div className='tt__timeline-now'>
                        <img src={IMG_URL_BASE + "pin-location-white-icon.svg"} className='w-[30px]' />
                    </div>
                </div>
                <div className='tt__timeline-header'>
                </div>
            </div>
            <div className='tt__right-container col-span-8 h-full flex justify-start items-center'>
                <div className='tni__description'>We're here</div>
                <div className='tni__description  cursor-pointer hover:opacity-90' onClick={handleShowHistory}>View history</div>
            </div>
        </div>
    )
}

export default ToeicNowItem