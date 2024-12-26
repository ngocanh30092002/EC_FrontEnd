import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { IMG_URL_BASE } from '~/GlobalConstant.js';
import { CreateRandom } from '@/helper/RandomHelper';

function ToeicTimeItem({data, year, index}) {
    const [isShowList, setIsShowList] = useState(false);

    const handleShowList = () =>{
        setIsShowList(!isShowList);
    }

    return (
        <div className='grid grid-cols-12 w-full flex-1 toeic-time__wrapper items-center overflow-visible mt-[10px]'>
            <div className='tt__left-container col-span-3 flex items-center justify-center'>
                <div className='ttr__toeic-name cursor-pointer text-center line-clamp-1' onClick={handleShowList}>
                    Toeic {year}
                </div>
            </div>
            <div className='flex justify-center h-full overflow-visible'>
                <div className='tt__timeline'>
                    <div className='tt__timeline-no'>{index + 1}</div>
                </div>
            </div>
            <div className='tt__right-container col-span-8'>
                <div className={`grid grid-cols-12 gap-x-[10px] gap-y-[10px] ttr__toeic-exams--wrapper mr-[30px] ml-[10px] relative overflow-hidden ${isShowList ? "max-h-full": "max-h-[110px]"}`}>
                    {
                        data.map((item, index) => {
                            return <ToeicExamItem key={index} examInfo ={item} />
                        })
                    }
                </div>
            </div>
        </div>
    )
}

function ToeicExamItem({examInfo}) {
    const navigate = useNavigate();
    const handleClickExam = () =>{
        const sessionId = CreateRandom();
        sessionStorage.setItem(sessionId, examInfo.toeicId);

        navigate(`/examination?id=${sessionId}&type=2`,{
            replace: true
        }) 
    }
    return (
        <div className={`col-span-4 ttr__toeic-exam flex justify-between items-center `} onClick={handleClickExam}>
            <div>
                <div className='te__title te__title'>
                    {examInfo?.name}
                </div>

                <div className='te__made-num mt-[5px]'>
                    {examInfo?.completed_Num} completed 
                </div>
                <div className='te__time'>
                    {examInfo?.point} point - {examInfo?.timeMinutes} min
                </div>
            </div>

            <img src={IMG_URL_BASE + "next_page_icon.svg"} alt="" className="te__icon-img" />
        </div>
    )
}

export default ToeicTimeItem