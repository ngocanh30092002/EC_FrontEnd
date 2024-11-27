import React, { useState } from 'react'
import { IMG_URL_BASE } from '~/GlobalConstant.js';
import "../ExamStyle.css"
function InprocessVolumn({ onSetVolume, volume }) {
    const [isShowVolumn, setIsShowVolumn] = useState(false);
    const [volumeValue, setVolumeValue] = useState(volume);
    const handleShowVolumn = () => {
        setIsShowVolumn(!isShowVolumn);
    }
    const handleChangeVolumn = (e) => {
        setVolumeValue(e.target.value);
    }

    const handleMouseLeave = () => {
        onSetVolume(volumeValue);
        setIsShowVolumn(false);
    }

    const handleMouseEnter = () => {
        setIsShowVolumn(true);
    }
    return (
        <div className='fixed z-10 bottom-[34px] left-0 translate-x-[50%] overflow-visible'>
            <div className='overflow-visible flex flex-col items-center w-[50px] volume__wrapper' onMouseLeave={handleMouseLeave}>
                <input
                    className={`volumn-input ${!isShowVolumn && "hidden"}`}
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={volumeValue}
                    onChange={handleChangeVolumn}
                />

                <div className='inprocess-volumn-icon'>
                    {volumeValue == 0 ?
                        <img src={IMG_URL_BASE + "volume-mute-icon.svg"} className='w-[25px] ' onClick={handleShowVolumn} onMouseEnter={handleMouseEnter} />
                        :
                        <img src={IMG_URL_BASE + "volume-icon.svg"} className='w-[25px] ' onClick={handleShowVolumn} onMouseEnter={handleMouseEnter} />
                    }
                </div>
            </div>
        </div>
    )
}

export default InprocessVolumn