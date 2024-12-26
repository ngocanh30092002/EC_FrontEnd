import React, { useContext, useEffect, useRef, useState } from 'react'
import { appClient } from '~/AppConfigs';
import DropDownList from '../../../CommonComponent/DropDownList';
import { IMG_URL_BASE } from '~/GlobalConstant.js';
import toast from '@/helper/Toast';
import { useParams } from 'react-router-dom';
import { ToeicAddQuestionContext } from './ToeicAddQuestion';
import { list } from 'postcss';
import QuestionPart1 from './QuestionPart1';
import QuestionPart2 from './QuestionPart2';
import QuestionConversation from './QuestionConversation';
import QuestionPart5 from './QuestionPart5';

function QuestionAddMain({ toeicId, isReload }) {
    const [partTypes, setPartTypes] = useState([]);
    const [currentQuesNum, setCurrentQuesNum] = useState(0);
    const [defaultIndexType, setDefaultIndexType] = useState(0);
    const [selectedType, setSelectedType] = useState(null);
    const dataContext = useContext(ToeicAddQuestionContext);

    const inputCurrentQuesRef = useRef(null);

    const getPartTypes = async () => {
        try {
            let response = await appClient.get("api/HomeQues/part-types");
            let dataRes = response.data;
            if (dataRes.success) {
                setPartTypes(dataRes.message);
                setDefaultIndexType(0);
                setSelectedType(dataRes.message[0]);
            }
        }
        catch {

        }
    }

    const getCurrentQuestion = async (part) => {
        try {
            let response = await appClient.get(`api/QuesToeic/toeic/${toeicId}/next-ques-no?part=${part}`);
            let dataRes = response.data;
            setCurrentQuesNum(dataRes);
            inputCurrentQuesRef.current.value = dataRes;
        }
        catch {

        }
    }

    const handleSelectedType = (item, index) => {
        setDefaultIndexType(index);
        setSelectedType(item);
    }

    const handleShowListBar = () => {
        dataContext.showListBar(false);
    }

    useEffect(() => {
        getPartTypes();
    }, [])

    useEffect(() => {
        if (selectedType != null) {
            getCurrentQuestion(selectedType.value);
        }
    }, [selectedType, isReload])

    return (
        <div className='qam__wrapper flex flex-col  overflow-visible p-[20px] h-full'>
            <div className="flex items-center overflow-visible">
                <div className='flex items-center flex-1 '>
                    <div className="qam__title-input">Question</div>
                    <input className='qam__input' readOnly ref={inputCurrentQuesRef} />
                </div>
                <div className='flex items-center flex-1 overflow-visible'>
                    <div className="qam__title-input">Part</div>
                    <DropDownList
                        data={partTypes}
                        defaultIndex={defaultIndexType}
                        onSelectedItem={handleSelectedType}
                        className={"qam__input border border-[#cccccc] !rounded-[20px]"}
                        tblClassName={"!h-[160px]"}
                        hideDefault={true}
                    />
                </div>

                <button className='tqa__btn-show' onClick={handleShowListBar}>
                    <img src={IMG_URL_BASE + "menu-icon.svg"} className='w-[30px] p-[5px]' />
                </button>

            </div>

            <QuestionInputForm part={selectedType?.value} currentQues={currentQuesNum} />
        </div>
    )
}

function QuestionInputForm({ currentQues, part }) {
    const isConversation = part == 3 || part == 4 || part == 6 || part == 7;

    return (
        <div className='flex flex-col overflow-visible flex-1'>
            {part == 1 && <QuestionPart1 currentQues={currentQues}/>}
            {part == 2 && <QuestionPart2 currentQues={currentQues}/>}
            {isConversation && <QuestionConversation currentQues={currentQues} part={part}/>}
            {part == 5 && <QuestionPart5 currentQues={currentQues}/>}
        </div>
    )
}



export default QuestionAddMain