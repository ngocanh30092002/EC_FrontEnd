import React, { useEffect, useState } from 'react'
import ExamHeader from '../ExamHeader'
import ExamFooter from '../ExamFooter'
import OverviewExamInfo from './OverviewExamInfo'
import OverViewUserProfile from './OverViewUserProfile'
import { useLocation } from 'react-router-dom'
import { IMG_URL_BASE } from '~/GlobalConstant.js';
import { appClient } from '~/AppConfigs';

function OverViewPage() {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const [mode, setMode] = useState(() => {
        if(params.get("mode") == "toeic-test"){
            return 1; // toeic
        }
        if(params.get("mode") == "homework"){
            return 2; // homework
        }
        if(params.get("mode") == "road-map-test"){
            return 3; // road map exam
        }
        return 0; // examination
    })

    const [direction, setDirection] = useState(null);
    const [title,setTitle] = useState("");
    const [examInfo, setExamInfo] = useState(location.state);

    useEffect(() => {
        const getToeicDirection = (id) => {
            appClient.get(`api/toeicexams/${id}/direction`)
                .then(res => res.data)
                .then(data => {
                    if (data.success) {
                        setDirection(data.message);
                    }
                });
        }

        const getDirection = (id) => {
            appClient.get(`api/ToeicDirection/${id}`)
                .then(res => res.data)
                .then(data => {
                    if (data.success) {
                        setDirection(data.message);
                    }
                });
        }


        if (mode == 1) {
            getToeicDirection(examInfo.toeicInfo.toeicId)
            setTitle(examInfo.toeicInfo.name);
        }
        if(mode == 0) {
            getToeicDirection(examInfo.examination.toeicId);
            setTitle(examInfo.examination.title);
        }

        if(mode == 2){
            setTitle(examInfo.homework.title);
            getToeicDirection(1);
        }

        if(mode == 3){
            setTitle(examInfo.roadMapInfo.name);
            getDirection(examInfo.roadMapInfo.directionId)
        }
    }, [])

    return (
        <div className='w-full h-screen flex flex-col relative z-0'>
            <ExamHeader />
            <div className='ovei__title overflow-hidden col-span-12 h-fit'>{title}</div>
            <div className='grid grid-cols-12 gap-[15px] p-[15px] h-full mb-[34px]'>
                <OverviewExamInfo className={"col-span-9"} examInfo={examInfo} direction={direction} mode={mode} />
                <OverViewUserProfile className={"col-span-3"} examInfo={examInfo} />
            </div>
            <ExamFooter isFixed={true} message={mode == 1 ? examInfo?.examination?.description : null} />
            <img src={IMG_URL_BASE + "overview_bg.jpg"} className='absolute top-0 left-0 z-[-1] w-screen h-screen object-cover opacity-80' />
        </div>
    )
}

export default OverViewPage