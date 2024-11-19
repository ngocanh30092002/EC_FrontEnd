import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE } from '~/GlobalConstant';

function OverviewExamInfo({ className, examInfo, direction, isToeic }) {
    const [numQues, setNumQues] = useState(null);
    const [volume, setVolume] = useState(1);
    const [isShowVolume, setIsShowVolume] = useState(false);
    const audioRef = useRef(null);

    const navigate = useNavigate();

    useEffect(() => {
        const getNumQuesExamination = (id) => {
            appClient.get(`api/questoeic/toeic/${id}/num-ques`)
                .then(res => res.data)
                .then(data => {
                    if (data.success) {
                        setNumQues(data.message);
                    }
                });
        }

        if(isToeic){
            getNumQuesExamination(examInfo.toeicInfo.toeicId);
        }
        else{
            getNumQuesExamination(examInfo.examination.toeicId);
        }

        return () =>{
            if(audioRef.current){
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }
        }
    }, [])

    const handleAttemp = () => {
        const getQuesInfo = (id) => {
            appClient.get(`api/QuesToeic/toeic/${id}`)
                .then(res => res.data)
                .then(data => {
                    if (data.success) {
                        navigate("/examination/in-process", {
                            state: {
                                ques: data.message,
                                userInfo: examInfo,
                                direction: direction,
                                volume: volume,
                                isToeicMode: isToeic
                            }
                        })
                    }
                })
        }

        if(isToeic){
            getQuesInfo(examInfo.toeicInfo.toeicId)
        }
        else{
            getQuesInfo(examInfo.examination.toeicId)
        }
    }

    const handleClickAudio = () =>{
        if(audioRef.current.paused){
            audioRef.current.play();
        }
        else{
            audioRef.current.pause();
        }

        setIsShowVolume(!isShowVolume);
    }

    const handleSetVolume = (e) =>{
        setVolume(e.target.value);
    }

    useEffect(() =>{
        if(audioRef.current){
            audioRef.current.volume = volume;
        }
    }, [volume])
 
    return (
        <div className={`${className} ovei__wrapper flex flex-col`}>
            <div className='w-full h-full flex justify-center items-center'>
                <div className='ovei__main h-fit p-[20px] min-h-[450px] bg-white'>
                    <div className='flex justify-between'>
                        <div className='flex items-center'>
                            <span className='ovei__info--title'>Exam Time: </span>
                            <span className='ovei__info--time'>{isToeic ? examInfo.toeicInfo.time : examInfo.examination.time}</span>
                        </div>

                        <div className='flex '>
                            <input
                                className={`rotate-180 overview-volume-input ${!isShowVolume && "hidden"} mr-[5px]`}
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={volume}
                                onChange={handleSetVolume}
                            />
                            {
                                volume == 0 ?
                                <img src={IMG_URL_BASE + "volume-mute-icon1.svg"} className='w-[30px] rotate-180 overview-volume-img' onClick={handleClickAudio}/>
                                :
                                <img src={IMG_URL_BASE + "volume-icon1.svg"} className='w-[30px] rotate-180 overview-volume-img' onClick={handleClickAudio}/>
                            }
                        </div>
                    </div>

                    <div>
                        <span className='ovei__info--title'>Exam structure</span>
                        <div className='flex justify-center items-center mt-[10px]'>
                            <div className='flex'>
                                <div className='mr-[20px] p-[20px]'>
                                    <div className='ovei__part-title'>Listening</div>
                                    <div className='flex justify-center mt-[10px]'>
                                        <div className='ovei__table-header'>
                                            <div>Part 1</div>
                                            <div>Part 2</div>
                                            <div>Part 3</div>
                                            <div>Part 4</div>
                                        </div>
                                        <div className='ovei__table-content'>
                                            <div>{numQues?.part1} questions</div>
                                            <div>{numQues?.part2} questions</div>
                                            <div>{numQues?.part3} questions</div>
                                            <div>{numQues?.part4} questions</div>
                                        </div>
                                    </div>
                                </div>
                                <div className='p-[20px]'>
                                    <div className='ovei__part-title'>Reading</div>
                                    <div className='flex justify-center  mt-[10px]'>
                                        <div className='ovei__table-header'>
                                            <div>Part 5</div>
                                            <div>Part 6</div>
                                            <div>Part 7</div>
                                        </div>
                                        <div className='ovei__table-content'>
                                            <div>{numQues?.part5} questions</div>
                                            <div>{numQues?.part6} questions</div>
                                            <div>{numQues?.part7} questions</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <audio preload='auto' ref={audioRef}>
                        <source src={IMG_URL_BASE + "audio-check.mp3"} type="audio/mpeg" />
                    </audio>

                    <div className='flex justify-center mt-[50px]'>
                        <button className='ovei__btn' onClick={handleAttemp}>Start now</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OverviewExamInfo