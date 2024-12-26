import React, { useContext, useEffect, useState } from 'react';
import { IMG_URL_BASE } from '~/GlobalConstant.js';
import { ToeicAddQuestionContext } from './ToeicAddQuestion';

function QuestionListBar({ quesInfos, onShow }) {
    const [groupData, setGroupData] = useState({});
    const [isShowDetail, setIsShowDetail] = useState(false);
    const dataContext = useContext(ToeicAddQuestionContext);

    useEffect(() => {
        const groupedData = quesInfos.reduce((data, item) => {
            if (!data[item.part]) {
                data[item.part] = [];
            }

            data[item.part].push(item);
            return data;
        }, {})

        for (let i = 1; i <= 7; i++) {
            if (!groupedData[i]) {
                groupedData[i] = [];
            }
        }
        setGroupData(groupedData);

    }, [quesInfos])

    const handleClickQuestion = (item) => {
        dataContext.showDetail(true, item);
    }

    const handleMinimizeClick = () => {
        onShow(true);
    }

    return (
        <>
            <div className='flex flex-col p-[10px] relative'>
                {
                    Object.keys(groupData).map((key, index) => {
                        return (
                            <div key={index}>
                                <div className='flex items-center justify-between'>
                                    <div className='qlb__title'>
                                        Part {key}
                                    </div>
                                    {
                                        index == 0 &&
                                        <button className='p-[8px] qlb__btn--mini w-[35px] h-[35px] rounded-[8px]' onClick={handleMinimizeClick}>
                                            <img src={IMG_URL_BASE + "minus-icon.svg"} className='w-[20px] p-[2px]' />
                                        </button>
                                    }
                                </div>
                                <div className='grid grid-cols-6 gap-y-[10px] min-h-[35px]'>
                                    {groupData[key].map((queItem, queIndex) => {
                                        return (
                                            <div className='qlb__question-no' key={queIndex} onClick={(e) => handleClickQuestion(queItem)}>
                                                {queItem.quesNo}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </>
    )
}



export default QuestionListBar