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
    const [isToeic, setIsToeic] = useState(() => {
        return params.get("mode") == "toeic-test";
    })
    const [direction, setDirection] = useState(null);
    const [examInfo, setExamInfo] = useState(location.state);

    useEffect(() => {
        const mode = params.get("mode");
        const getToeicDirection = (id) => {
            appClient.get(`api/toeicexams/${id}/direction`)
                .then(res => res.data)
                .then(data => {
                    if (data.success) {
                        setDirection(data.message);
                    }
                });
        }

        if (isToeic) {
            getToeicDirection(examInfo.toeicInfo.toeicId)
        }
        else {
            getToeicDirection(examInfo.examination.toeicId);
        }
    }, [])

    return (
        <div className='w-full h-screen flex flex-col relative z-0'>
            <ExamHeader />
            <div className='ovei__title overflow-hidden col-span-12 h-fit'>{isToeic ? examInfo.toeicInfo.name : examInfo.examination.title}</div>
            <div className='grid grid-cols-12 gap-[15px] p-[15px] h-full mb-[34px]'>
                <OverviewExamInfo className={"col-span-9"} examInfo={examInfo} direction={direction} isToeic={isToeic}/>
                <OverViewUserProfile className={"col-span-3"} examInfo={examInfo} />
            </div>
            <ExamFooter isFixed={true} message={isToeic ? null : examInfo.examination.description} />
            <img src={IMG_URL_BASE + "overview_bg.jpg"} className='absolute top-0 left-0 z-[-1] w-screen h-screen object-cover opacity-80' />
        </div>
    )
}

export default OverViewPage