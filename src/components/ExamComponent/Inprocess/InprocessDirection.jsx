import React, { memo, useContext, useEffect, useRef, useState } from 'react'
import { ExaminationContext } from './InprocessPage'
import { APP_URL } from '~/GlobalConstant.js';
import { useLocation } from 'react-router-dom';

function InprocessDirection({ className, direction, lastType, onShowDirection , volume}) {
    const { question, countDown } = useContext(ExaminationContext);
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const audioRef = useRef(null);
    const partProperty = `part${lastType ?? 1}`;
    const audioProperty = `audio${lastType ?? 1}`;
    const handleClick = () => {
        countDown.resume();
        countDown.show();
        onShowDirection(false);
    }

    useEffect(() => {
        countDown.pause();
        countDown.hide();
    }, [])

    useEffect(() =>{
        if(audioRef.current){
            audioRef.current.volume = volume;
        }
    }, [volume])

    useEffect(() => {
        const audioElement = audioRef.current;

        const handleCanPlay = () => {
            audioElement.muted = false;
            audioElement.play();
        };

        const handleEndAudio = () => {
            setTimeout(() => {
                countDown.resume();
                countDown.show();
                onShowDirection(false);
            }, 500);
        };


        if (audioElement) {
            audioElement.addEventListener('ended', handleEndAudio);
            audioElement.addEventListener('canplaythrough', handleCanPlay);
        }

        return () => {
            if (audioElement) {
                audioElement.pause();
                audioElement.currentTime = 0;
                audioElement.addEventListener('ended', handleEndAudio);
                audioElement.removeEventListener('canplaythrough', handleCanPlay);
            }

            countDown.resume();
            if(params.get("mode") != "view-answer"){
                countDown.show();
            }
        };
    }, [])

    return (
        <div className={`${className} p-[20px] relative`}>
            {(lastType == null || lastType == 1) && <div className='id__title_part'>Listening Test</div>}
            {lastType == 5 && <div className='id__title_part'>Reading Test</div>}
            {(lastType == null || lastType == 1) && <div className='id__introduce-text'>{direction.introduce_Listening}</div>}
            {lastType == 5 && <div className='id__introduce-text'>{direction.introduce_Reading}</div>}

            <div className='id__part'>Part {lastType ?? 1}</div>

            <div className='id__direction-text'>
                <span>Directions: </span>
                {direction?.[partProperty]}
            </div>

            <div className='flex justify-center'>
                {(lastType == null || lastType == 1) && <img src={APP_URL + direction.image} className='w-[450px] my-[20px]' />}
            </div>

            <div className='absolute bottom-0 left-[50%] translate-x-[-50%]'>
                <button onClick={handleClick} className='id_btn-start'>Start</button>
            </div>

            {direction?.[audioProperty] &&
                <audio controls preload='auto' ref={audioRef} muted={true} className='hidden'>
                    <source src={APP_URL + direction[audioProperty]} type="audio/mpeg" />
                </audio>
            }
        </div>
    )
}

export default memo(InprocessDirection)