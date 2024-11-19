import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE } from '~/GlobalConstant';
import { CreateRandom } from '@/helper/RandomHelper';
import { InProcessContext } from './InProcessAssignPage';
import { APP_URL } from '~/GlobalConstant.js';

function InProcessSubmitInfo({ processId, ...props }) {
    const navigate = useNavigate();
    const userInfo = props.userInfo;
    const {answer} = useContext(InProcessContext);
    const [time, setTime] = useState("00:00:00");
    const [scoreInfo, setScoreInfo] = useState();

    const timeToSeconds = (timeStr) => {
        const [hours, minutes, seconds] = timeStr.split(':').map(Number);
        return (hours * 3600) + (minutes * 60) + seconds;
    }

    const secondToTime = (totalSeconds) => {
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return [
            String(hours).padStart(2, '0'),
            String(minutes).padStart(2, '0'),
            String(seconds).padStart(2, '0')
        ].join(':');
    }

    useEffect(() => {
        const countDownElement = document.getElementById("countdown-time");
        const remainTime = timeToSeconds(userInfo?.assignment?.time) - timeToSeconds(countDownElement.innerHTML);

        setTime(secondToTime(remainTime < 0 ? 0 : remainTime));

        const scorePromise = async () => {
            try {

                const response = await appClient.get(`api/LearningProcesses/${processId}/score`);
                const data = response.data;

                if (data.success) {
                    return data.message;
                }

                return null;
            }
            catch {
                return null;
            }
        }

        scorePromise().then(data => {
            setScoreInfo(data);
        })

    }, [processId])

    const handleBackToCourse = () => {
        navigate(`/courses/detail/${props.userInfo?.course}`)
        localStorage.clear();
        sessionStorage.clear();
    }

    const handleReAttempted = () =>{
        localStorage.clear();
        sessionStorage.clear();

        const sessionId = CreateRandom();
        sessionStorage.setItem(sessionId, userInfo?.enrollId);

        navigate(`/assignment?id=${sessionId}&assignmentId=${userInfo?.assignment?.assignmentId}`);
    }

    const handleCloseClick = () => {
        props.onShowSubmitInfo(false);
    }

    const handleViewResult = () =>{
        const getResult = () =>{
            appClient.get(`api/AssignmentRecords/processes/${processId}/result`)
            .then(res => res.data)
            .then(data => answer.addResult(data.message))
        }

        getResult();

        props.onShowSubmitInfo(false);
    }

    return (
        <div className='fixed z-100 top-0 left-0 w-full h-full bg-gray-400 bg-opacity-40'>
            <div className='absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[700px] bg-white p-[30px] rounded-[10px] psi__wrapper'>
                <div className="psi__user-info--wrapper flex">
                    <img src={userInfo?.user?.image ? APP_URL + userInfo.user.image : IMG_URL_BASE + "user_image.jpg"} className='w-[100px] h-[100px] rounded-[10px]' />

                    <div className='ml-[20px] psi__user-info flex flex-col justify-between'>
                        <div className='psi__user-name'>{userInfo?.user?.firstName} {userInfo?.user?.lastName}</div>
                        <div className='flex items-center'>
                            <span className='text-[12px] font-medium  inline-block  min-w-[60px]'>Course:</span>
                            <span className='text-[12px]'>{userInfo?.class}</span>
                        </div>
                        <div className='flex items-center'>
                            <span className='text-[12px] font-medium inline-block min-w-[60px]'>Class:</span>
                            <span className='text-[12px]'>{userInfo?.course}</span>
                        </div>
                        <div className='flex items-center'>
                            <span className='text-[12px] font-medium  inline-block  min-w-[60px]'>Time:</span>
                            <span className='text-[12px]'>{time}</span>
                        </div>
                    </div>
                </div>
                <div className=' rounded-[8px] mt-[20px]'>
                    <div className='flex psi__table-header mt-[10px] bg-gray-200  rounded-t-[8px]'>
                        <div className='w-1/5'>Correct</div>
                        <div className='w-1/5'>Total</div>
                        <div className='w-1/5'>Rate</div>
                        <div className='w-1/5'>Pass Rate</div>
                        <div className='w-1/5'>Status</div>
                    </div>

                    <div className='flex psi__table-body mt-[10px]'>
                        <div className='w-1/5'>{scoreInfo?.correct}</div>
                        <div className='w-1/5'>{scoreInfo?.total}</div>
                        <div className='w-1/5'>{scoreInfo?.current_Percentage}%</div>
                        <div className='w-1/5'>{scoreInfo?.achieve_Percentage}%</div>
                        <div className='w-1/5'>{scoreInfo?.isPass ? "Passed" : "Failed"}</div>
                    </div>
                </div>

                <div className='flex justify-end mt-[20px] min-h-[48px]'>
                    <button className='psi-btn' onClick={handleViewResult}>
                        <div className='bg-red-400 psi-btn--bg-color absolute'></div>
                        View
                    </button>
                    <button className='psi-btn' onClick={handleReAttempted}>
                        <div className='bg-blue-400 psi-btn--bg-color absolute'></div>
                        Re-Attemped
                    </button>
                    <button className='psi-btn' onClick={handleBackToCourse}>
                        <div className='bg-gray-400 psi-btn--bg-color absolute'></div>
                        Back
                    </button>
                </div>

                <div
                    className='absolute top-[20px] right-[20px] cursor-pointer p-[10px] rounded-[8px] hover:bg-gray-50 hover:transition-all duration-100'
                    onClick={handleCloseClick}
                >
                    <img src={IMG_URL_BASE + "close.svg"} className='w-[20px] ' />
                </div>
            </div>
        </div>
    )
}

export default InProcessSubmitInfo