import React, { memo, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import { ExaminationContext } from './InprocessPage';

function InprocessSubmitInfo({ onShowSubmitInfo, userInfo, mode, attemptId }) {
    const navigate = useNavigate();
    const [scoreInfo, setScoreInfo] = useState({});
    const [time, setTime] = useState("00:00:00");
    const [numQues, setNumQues] = useState({});
    const { userInfo: userInfoObj, examination, toeicInfo, class: classObj, homework, roadMapInfo } = userInfo;
    const { answer } = useContext(ExaminationContext);

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
        let timeExam = undefined;
        let toeicId = undefined;

        if (mode == 1) {
            timeExam = toeicInfo.time;
            toeicId = toeicInfo.toeicId
        }
        if (mode == 0) {
            timeExam = examination.time;
            toeicId = examination.toeicId;
        }
        if (mode == 2) {
            timeExam = homework.time;
        }
        if (mode == 3) {
            timeExam = roadMapInfo.time;
        }

        const remainTime = timeToSeconds(timeExam) - timeToSeconds(countDownElement.innerHTML);

        setTime(secondToTime(remainTime < 0 ? 0 : remainTime));

        const getScoreInfoWithExam = () => {
            appClient.get(`api/LearningProcesses/${userInfo.processId}/score`)
                .then(res => res.data)
                .then(data => {
                    if (data.success) {
                        setScoreInfo(data.message);
                    }
                })
        }

        const getScoreInfoWithToeic = () => {
            appClient.get(`api/toeicpractice/attempt/${attemptId}/score`)
                .then(res => res.data)
                .then(data => {
                    if (data.success) {
                        setScoreInfo(data.message);
                    }
                })
        }

        const getNumQues = (toeicId) => {
            appClient.get(`api/QuesToeic/toeic/${toeicId}/num-ques`)
                .then(res => res.data)
                .then(data => {
                    if (data.success) {
                        setNumQues(data.message);
                    }
                })
        }

        const getNumQuesHomework = (homeworkId) => {
            appClient.get(`api/randomques/homework/${homeworkId}/num-ques`)
                .then(res => res.data)
                .then(data => {
                    if (data.success) {
                        setNumQues(data.message);
                    }
                });
        }

        const getNumQuesRoadMap = (roadMapId) => {
            appClient.get(`api/randomques/road-map-exams/${roadMapId}/num-ques`)
                .then(res => res.data)
                .then(data => {
                    if (data.success) {
                        setNumQues(data.message);
                    }
                });
        }

        const getScoreInfoWithHomework = () => {
            appClient.get(`api/HwSubmission/${userInfo.submissionId}/score`)
                .then(res => res.data)
                .then(data => {
                    if (data.success) {
                        setScoreInfo(data.message);
                    }
                })
        }

        const getScoreInfoWithRoadMap = () => {
            appClient.get(`api/toeicpractice/attempt/${attemptId}/score`)
                .then(res => res.data)
                .then(data => {
                    if (data.success) {
                        setScoreInfo(data.message);
                    }
                })
        }

        if (mode == 1) {
            getScoreInfoWithToeic();
            getNumQues(toeicId);
        }
        if (mode == 0) {
            getScoreInfoWithExam();
            getNumQues(toeicId);
        }
        if (mode == 2) {
            getScoreInfoWithHomework();
            getNumQuesHomework(homework.homeworkId);
        }
        if (mode == 3) {
            getNumQuesRoadMap(roadMapInfo.id);
            getScoreInfoWithRoadMap();
        }


    }, [])

    const handleViewResult = () => {
        const getResultExam = () => {
            appClient.get(`api/ToeicRecords/processes/${userInfo.processId}/result`)
                .then(res => res.data)
                .then(data => {
                    if (data.success) {
                        answer.addResult(data.message)
                    }
                })
        }

        const getResultToeic = () => {
            appClient.get(`api/ToeicPractice/attempt/${attemptId}/result-answer`)
                .then(res => res.data)
                .then(data => {
                    if (data.success) {
                        answer.addResult(data.message)
                    }
                })
        }

        const getResultHomework = () => {
            appClient.get(`api/HwSubRecords/${userInfo.submissionId}/result`)
                .then(res => res.data)
                .then(data => {
                    if (data.success) {
                        answer.addResult(data.message)
                    }
                    console.log(data);
                })
        }

        if (mode == 1) {
            getResultToeic();
        }
        if (mode == 0) {
            getResultExam();
        }
        if (mode == 2) {
            getResultHomework();
        }
        if(mode == 3){
            getResultToeic();
        }

        onShowSubmitInfo(false);
    }

    const handleBackToCourse = () => {
        navigate(-1);

        localStorage.clear();
        sessionStorage.clear();
    }

    const handleCloseClick = () => {
        onShowSubmitInfo(false);
    }

    return (
        <div className='fixed z-20 top-0 left-0 w-full h-full bg-gray-400 bg-opacity-40' onClick={(e) => onShowSubmitInfo(false)}>
            <div
                className='absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[700px] bg-white p-[30px] rounded-[10px] psi__wrapper'
                onClick={(e) => e.stopPropagation()}
            >
                <div className="psi__user-info--wrapper flex">
                    <img src={userInfoObj?.image == null || userInfoObj?.image == ""  ? IMG_URL_BASE + "unknown_user.jpg" : APP_URL + userInfoObj.image} className='w-[100px] h-[100px] rounded-[10px]' />

                    <div className='ml-[20px] psi__user-info flex flex-col justify-between'>
                        <div className='psi__user-name'>{userInfoObj.firstName} {userInfoObj.lastName}</div>
                        {
                            (mode == 1 || mode == 3) && userInfoObj?.dateOfBirth &&
                            <div className='flex items-center'>
                                <span className='text-[12px] font-medium  inline-block  min-w-[70px]'>Birthday:</span>
                                <span className='text-[12px]'>{userInfoObj.dateOfBirth}</span>
                            </div>
                        }
                        {
                            (mode == 1 || mode == 3) && userInfoObj?.email &&
                            <div className='flex items-center'>
                                <span className='text-[12px] font-medium  inline-block  min-w-[70px]'>Email:</span>
                                <span className='text-[12px]'>{userInfoObj.email}</span>
                            </div>
                        }
                        {
                            classObj?.courseId &&
                            <div className='flex items-center'>
                                <span className='text-[12px] font-medium  inline-block  min-w-[70px]'>Course:</span>
                                <span className='text-[12px]'>{classObj.courseId}</span>
                            </div>
                        }
                        {
                            classObj?.classId &&
                            <div className='flex items-center'>
                                <span className='text-[12px] font-medium inline-block min-w-[70px]'>Class:</span>
                                <span className='text-[12px]'>{classObj.classId}</span>
                            </div>
                        }
                        <div className='flex items-center'>
                            <span className='text-[12px] font-medium  inline-block  min-w-[70px]'>Time:</span>
                            <span className='text-[12px]'>{time}</span>
                        </div>
                    </div>
                </div>
                <div className="psit__table-score">
                    <div className='psit__header flex'>
                        <div className={"w-1/4"}></div>
                        <div className={"w-1/4"}>Correct</div>
                        <div className={"w-1/4"}>Questions</div>
                        <div className={"w-1/4"}>Points</div>
                    </div>

                    <div className='psit__body w-full'>
                        <div className='flex'>
                            <div className='psit__wrapper-row w-3/4'>
                                <div className='psit__row  flex'>
                                    <div className='w-1/3 psit__item-title'>Part 1</div>
                                    <div className='w-1/3 psit__item-value'>{scoreInfo?.part1 ?? 0}</div>
                                    <div className='w-1/3 psit__item-value'>{numQues?.part1 ?? 0}</div>
                                </div>

                                <div className='psit__row  flex'>
                                    <div className='w-1/3 psit__item-title'>Part 2</div>
                                    <div className='w-1/3 psit__item-value'>{scoreInfo?.part2 ?? 0}</div>
                                    <div className='w-1/3 psit__item-value'>{numQues?.part2 ?? 0}</div>
                                </div>
                                <div className='psit__row  flex'>
                                    <div className='w-1/3 psit__item-title'>Part 3</div>
                                    <div className='w-1/3 psit__item-value'>{scoreInfo?.part3 ?? 0}</div>
                                    <div className='w-1/3 psit__item-value'>{numQues?.part3 ?? 0}</div>
                                </div>
                                <div className='psit__row  flex'>
                                    <div className='w-1/3 psit__item-title'>Part 4</div>
                                    <div className='w-1/3 psit__item-value'>{scoreInfo?.part4 ?? 0}</div>
                                    <div className='w-1/3 psit__item-value'>{numQues?.part4 ?? 0}</div>
                                </div>
                            </div>
                            <div className='w-1/4 psit__listening-point'>
                                {scoreInfo?.listening}
                            </div>
                        </div>

                        <div className='flex'>
                            <div className='psit__wrapper-row w-3/4'>
                                <div className='psit__row  flex'>
                                    <div className='w-1/3 psit__item-title'>Part 5</div>
                                    <div className='w-1/3 psit__item-value'>{scoreInfo?.part5 ?? 0}</div>
                                    <div className='w-1/3 psit__item-value'>{numQues?.part5 ?? 0}</div>
                                </div>

                                <div className='psit__row  flex'>
                                    <div className='w-1/3 psit__item-title'>Part 6</div>
                                    <div className='w-1/3 psit__item-value'>{scoreInfo?.part6 ?? 0}</div>
                                    <div className='w-1/3 psit__item-value'>{numQues?.part6 ?? 0}</div>
                                </div>

                                <div className='psit__row  flex'>
                                    <div className='w-1/3 psit__item-title'>Part 7</div>
                                    <div className='w-1/3 psit__item-value'>{scoreInfo?.part7 ?? 0}</div>
                                    <div className='w-1/3 psit__item-value'>{numQues?.part7 ?? 0}</div>
                                </div>
                            </div>
                            <div className='w-1/4 psit__reading-point'>
                                {scoreInfo?.reading}
                            </div>
                        </div>

                        <div className='flex'>
                            <div className='psit__wrapper-row w-3/4'>
                                <div className='psit__row total flex'>
                                    <div className='w-1/3 !border-b-0 psit__item-title'>Total</div>
                                    <div className='w-1/3 !border-b-0 psit__item-value'>
                                        {
                                            Object.entries(scoreInfo)
                                                .filter(([key, value]) => key.startsWith("part"))
                                                .reduce((sum, [key, value]) => sum + value, 0)
                                            ??
                                            0
                                        }
                                    </div>
                                    <div className='w-1/3 !border-b-0 psit__item-value'>
                                        {
                                            Object.values(numQues).reduce((sum, value) => sum + value, 0)
                                            ??
                                            0
                                        }
                                    </div>
                                </div>
                            </div>
                            <div className='w-1/4 psit__reading-point !border-b-0 !border-t-0'>
                                {(scoreInfo?.listening || 0) + (scoreInfo?.reading || 0)}
                            </div>
                        </div>

                    </div>

                </div>

                <div className='flex justify-end mt-[20px] min-h-[48px]'>
                    <button className='psi-btn' onClick={handleViewResult}>
                        <div className='bg-red-400 psi-btn--bg-color absolute'></div>
                        View
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

export default memo(InprocessSubmitInfo)