import React, { memo, useContext, useEffect, useRef, useState } from 'react'
import { CLIENT_URL, IMG_URL_BASE } from '~/GlobalConstant.js';
import { ExaminationContext } from './Inprocess/InprocessPage';
import { useNavigate } from 'react-router-dom';

function ExamHeader({ isProcess = false, onShowAnswerSheet, isPaused, isHideCountDown, ...props }) {
    const navigate = useNavigate();
    const [timeSeconds, setTimeSeconds] = useState(() => {
        if (props.countDownTime) {
            const [hours, minutes, seconds] = props.countDownTime.split(":").map(Number);
            return (hours * 3600) + (minutes * 60) + seconds;
        }
        return 7200;
    });

    useEffect(() => {
        if (props.countDownTime) {
            setTimeSeconds(prev => {
                const [hours, minutes, seconds] = props.countDownTime.split(":").map(Number);
                return (hours * 3600) + (minutes * 60) + seconds;
            });
        }
    }, [])

    const handleClickHomePage = (e) => {
        e.preventDefault();

        localStorage.clear();
        sessionStorage.clear();

        navigate("/");
    }

    return (
        <div className='examination__header--wrapper flex justify-between items-center overflow-hidden'>
            {
                isProcess === false &&
                <div className='flex'>
                    <a className='examination__title-link' onClick={handleClickHomePage}>LEARNING SYSTEM</a>
                </div>
            }

            <a className='examination__btn-logo' onClick={handleClickHomePage}>
                <img className='examination__logo' src={IMG_URL_BASE + "logo.svg"} />
            </a>

            {
                isProcess === true &&
                <div className='flex items-center'>
                    {<CountdownTimer initialSeconds={timeSeconds} isPaused={isPaused} isHide={isHideCountDown} />}

                    <button className='examination__btn-menu' onClick={(e) => onShowAnswerSheet()}>
                        <img src={IMG_URL_BASE + "menu-icon.svg"} className='w-[30px]' />
                    </button>
                </div>
            }
        </div>
    )
}


function CountdownTimer({ initialSeconds, isPaused = false, isHide }) {
    const [seconds, setSeconds] = useState(initialSeconds);
    const { exam } = useContext(ExaminationContext);
    let intervalRef = useRef(null);

    useEffect(() => {
        let endTime = sessionStorage.getItem("time-span-end");
        if (!endTime) {
            const now = new Date().getTime();
            endTime = now + initialSeconds * 1000;
            sessionStorage.setItem("time-span-end", endTime);
        }

        const calculateTimeRemaining = () => {
            const currentTime = new Date().getTime();
            const timeLeft = endTime - currentTime;
            setSeconds(timeLeft > 0 ? Math.floor(timeLeft / 1000) : 0);
        };

        calculateTimeRemaining();
    }, [])

    useEffect(() => {
        if (isPaused) {
            sessionStorage.setItem("isPause", true);
            sessionStorage.setItem("time-pause", seconds);
        }
        else {
            sessionStorage.removeItem("isPause");
            const pauseSeconds = sessionStorage.getItem("time-pause");
            if (pauseSeconds) {
                const endTime = new Date().getTime() + pauseSeconds * 1000;
                sessionStorage.setItem("time-span-end", endTime);
                setSeconds(pauseSeconds);
            }
            sessionStorage.removeItem("time-pause");
        }

        if (!isPaused && seconds > 0) {
            intervalRef.current = setInterval(() => {
                setSeconds((prevTime) => prevTime - 1);
            }, 1000);
        }
        else if (isPaused) {
            clearInterval(intervalRef.current);
        }

        if (seconds == 0) {
            exam.submit(true);
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isPaused, seconds]);

    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = seconds % 60;

        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    };

    return (
        <div className={`pi__time-current flex items-center ${isHide == true && "!hidden"}`} id='countdown-time'>
            {formatTime(seconds)}
        </div>
    )
}
export default memo(ExamHeader)