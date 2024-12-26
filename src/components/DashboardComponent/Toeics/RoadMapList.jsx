import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { IMG_URL_BASE } from '~/GlobalConstant.js';
import { CreateRandom } from '@/helper/RandomHelper';

function RoadMapList({ selectedRoadMap, roadMaps }) {
    const [renderRoadMap, setRenderRoadMap] = useState([]);
    const [isShowList, setIsShowList] = useState(false);

    const handleShowList = () => {
        setIsShowList(!isShowList);
    }
    useEffect(() => {
        setRenderRoadMap(roadMaps.filter(r => r.courseId == selectedRoadMap));
    }, [selectedRoadMap])

    return (
        <>
            {renderRoadMap.map((item, index) => {
                return (
                    <div className='grid grid-cols-12 w-full flex-1 toeic-time__wrapper items-center overflow-visible mt-[10px] min-h-[107px]' key={index}>
                        <div className='tt__left-container col-span-3 flex items-center justify-end'>
                            <div className='ttr__toeic-name cursor-pointer text-center line-clamp-1' onClick={handleShowList}>
                                {item.roadMapName}
                            </div>
                        </div>
                        <div className='flex justify-center h-full overflow-visible'>
                            <div className='tt__timeline'>
                                <div className='tt__timeline-no'>{renderRoadMap.length - index}</div>
                            </div>
                        </div>
                        <div className='tt__right-container col-span-8'>
                            <div className={`grid grid-cols-12 gap-x-[10px] gap-y-[10px] ttr__toeic-exams--wrapper mr-[30px] ml-[10px] relative overflow-hidden ${isShowList ? "max-h-full" : "max-h-[110px]"}`}>
                                {item.roadMapExams.map((item, index) => {
                                    return (
                                        <RoadMapItem roadMapInfo={item} key={index} />
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )
            })}
        </>
    )
}

function RoadMapItem({ roadMapInfo }) {
    const navigate = useNavigate();
    const handleClickExam = () => {
        const sessionId = CreateRandom();
        sessionStorage.setItem(sessionId, roadMapInfo.id);

        navigate(`/examination/prepare-road-map?id=${sessionId}`,{
            replace: true
        }) 
    }

    return (
        <div className={`col-span-4 ttr__toeic-exam flex justify-between items-center `} onClick={handleClickExam}>
            <div>
                <div className='te__title line-clamp-1'>
                    {roadMapInfo.name}
                </div>

                <div className='te__made-num mt-[5px]'>
                    {roadMapInfo.completed_Num} completed
                </div>
                <div className='te__time'>
                    {roadMapInfo?.point} point - {roadMapInfo?.time_Minutes} min
                </div>
            </div>

            <img src={IMG_URL_BASE + "next_page_icon.svg"} alt="" className="te__icon-img" />
        </div>
    )
}

export default RoadMapList