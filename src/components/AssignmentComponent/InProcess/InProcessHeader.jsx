import React, { memo, useContext, useEffect, useRef, useState } from 'react'
import { IMG_URL_BASE, CLIENT_URL } from '~/GlobalConstant.js';
import { InProcessContext } from './InProcessAssignPage';

function InProcessHeader({ onShowAnswerList, countDownTime, isSubmitted }) {
    const { assignment } = useContext(InProcessContext);
    const [hours, minutes, seconds] = countDownTime.split(':').map(Number);
    const time = (hours * 3600) + (minutes * 60) + seconds;
    return (
        <div className='assignment__header--wrapper flex justify-between items-center'>
            <a className='assignment__btn-logo' href={CLIENT_URL}>
                <img className='assignment__logo' src={IMG_URL_BASE + "logo.svg"} />
            </a>

            <div className='flex items-center'>
                {<CountdownTimer initialSeconds={time} onSubmitAssignment={assignment.submit} isSubmitted={isSubmitted} />}

                <button className='assignment__btn-menu' onClick={onShowAnswerList}>
                    <img src={IMG_URL_BASE + "menu-icon.svg"} className='w-[30px]' />
                </button>
            </div>
        </div>
    )
}


function CountdownTimer({ initialSeconds, onSubmitAssignment, isSubmitted }) {
    const [seconds, setSeconds] = useState(initialSeconds);
    let intervalId = useRef(null);

    useEffect(() => {
        if (seconds === 0) {
            onSubmitAssignment(true);
            sessionStorage.removeItem("time-span-end");
            clearInterval(intervalId.current);
        }
    }, [seconds])

    useEffect(() => {
        if(isSubmitted === undefined){
            return ;
        }

        if (isSubmitted === false) {
            const now = new Date().getTime();

            let endTime = sessionStorage.getItem("time-span-end");

            if (!endTime) {
                endTime = now + initialSeconds * 1000;
                sessionStorage.setItem("time-span-end", endTime);
            }

            const calculateTimeRemaining = () => {
                const currentTime = new Date().getTime();
                const timeLeft = endTime - currentTime;

                setSeconds(timeLeft > 0 ? Math.floor(timeLeft / 1000) : 0);
            };

            calculateTimeRemaining();

            intervalId.current = setInterval(() => {
                setSeconds(prev => prev - 1);
            }, 1000);
        }

        return () => clearInterval(intervalId);

    }, [initialSeconds, isSubmitted])

    useEffect(() => {
        if (isSubmitted === true) {
            clearInterval(intervalId.current);
            let time = sessionStorage.getItem("Time");
            if(!time){
                sessionStorage.setItem("Time", seconds);
            }
            else{
                setSeconds(time);
            }
        }
    }, [isSubmitted])


    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    return (
        <div className="pi__time-current flex items-center" id='countdown-time'>
            {formatTime(seconds)}
        </div>
    )
}
export default memo(InProcessHeader)