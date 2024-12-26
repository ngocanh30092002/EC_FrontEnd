import React, { createContext, useContext, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import QuestionListBar from './QuestionListBar';
import { appClient } from '~/AppConfigs';
import QuestionAddMain from './QuestionAddMain';
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import { AnswerOptions } from '../../Course/CourseMainDetail/CourseExamination';
import toast from '@/helper/Toast';

export const ToeicAddQuestionContext = createContext();

function ToeicAddQuestion() {
    const [questionInfos, setQuestionInfos] = useState([]);
    const [isReload, setIsReload] = useState(false);
    const [listQues, setListQues] = useState([]);
    const [isMinimize, setIsMinimize] = useState(true);
    const [selectedQues, setSelectedQues] = useState(null);
    const [isShowDetail, setIsShowDetail] = useState(false);

    const navigate = useNavigate();
    const { toeicId } = useParams();

    const getCurrentQuestion = async () => {
        try {
            let response = await appClient.get(`api/QuesToeic/toeic/${toeicId}/ques-id`);
            let dataRes = response.data;
            if (dataRes.success) {
                setQuestionInfos(dataRes.message);
            }
        }
        catch {

        }
    }

    useEffect(() => {
        if (!toeicId) {
            navigate(-1);
            return;
        }

        getCurrentQuestion();
    }, [])

    useEffect(() => {
        if (questionInfos.length != 0) {

        }
    }, [questionInfos])

    const handleReloadCurrentQuestion = () => {
        getCurrentQuestion();
        setIsReload(!isReload);
    }

    const handleShowDetail = (value, data) => {
        setSelectedQues(data);
        setIsShowDetail(value);
    }

    const handleShowListBar = (value)=>{
        setIsMinimize(value);
    }
    const dataContext = {
        reload: handleReloadCurrentQuestion,
        showDetail: handleShowDetail,
        showListBar: handleShowListBar
    }

    return (
        <ToeicAddQuestionContext.Provider value={dataContext}>
            <div className='w-full flex mt-[10px] px-[10px] relative overflow-visible'>
                <div className='flex-1  h-full overflow-visible'>
                    <QuestionAddMain toeicId={toeicId} isReload ={isReload}/>
                </div>

                <div className={`fixed top-0 right-0 bg-white z-[1000] h-full border qlb__wrapper ${!isMinimize ? "w-[280px] max-w-[280px] translate-x-0" : "max-w-0  translate-x-[100%]"}`}>
                    <QuestionListBar quesInfos={questionInfos} onShow={setIsMinimize} />
                </div>

                {isShowDetail && <QuestionInfo onShow={setIsShowDetail} quesInfo={selectedQues} onMinimize={setIsMinimize}/>}

            </div>
        </ToeicAddQuestionContext.Provider>
    )
}

function QuestionInfo({ onShow, quesInfo, onMinimize }) {
    const [question, setQuestion] = useState(null);
    const dataContext = useContext(ToeicAddQuestionContext);

    useEffect(() => {
        const getQuestionInfo = async () => {
            try {
                const response = await appClient.get(`api/QuesToeic/${quesInfo.quesId}`);
                const dataRes = response.data;
                if (dataRes.success) {
                    setQuestion(dataRes.message);
                }
            }
            catch {

            }
        }

        getQuestionInfo();
    }, [quesInfo])

    const handleHidenBoard = (value) => {
        onShow(false);
        setQuestion(null);
        onMinimize(true);
    }

    const handleReload = () =>{
        dataContext.reload();
    }

    return (
        <div className='fixed top-0 left-0 w-full qi__wrapper h-full flex justify-center items-center z-[2001]' onClick={handleHidenBoard}>
            <div className='w-[1200px] h-[650px] p-[20px] bg-white ' onClick={(e) => e.stopPropagation()}>
                {
                    question != null &&
                    <>
                        {question.isGroup ?
                            <QuesGroup question={question} onShow={handleHidenBoard} isShowBtn={true} onReloadQuestion={handleReload} />
                            :
                            <QuesNoGroup question={question} onShow={handleHidenBoard} isShowBtn={true} onReloadQuestion={handleReload} />
                        }
                    </>
                }
            </div>
        </div>
    )
}

function QuesGroup({ question, className, onShow, onReloadQuestion }) {
    const audioRef = useRef();
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.load();
        }
    }, [question])

    const handleDeleteQuestion = async () => {
        try {
            let confirmAnswer = confirm("Do you want to delete this question ?");
            if (confirmAnswer) {
                let response = await appClient.delete(`api/QuesToeic/${question.quesId}`);
                let dataRes = response.data;
                if (dataRes.success) {
                    toast({
                        type: "success",
                        title: "Success",
                        message: "Delete question successfully",
                        duration: 4000
                    });

                    onReloadQuestion();
                    onShow(false);
                }
            }
        }
        catch {

        }
    }

    return (
        <div className={`w-full flex h-full justify-center items-center ceq__wrapper ${className}`} onClick={(e) => onShow(false)}>
            <div className='w-full h-full p-[20px] bg-white flex flex-col' onClick={(e) => e.stopPropagation()}>
                <div className='grid grid-cols-2 gap-[20px] flex-1'>
                    <div>
                        {question.image_1 !== "" && <img src={APP_URL + question.image_1} className='w-[85%] mx-auto' />}
                        {question.image_2 !== "" && <img src={APP_URL + question.image_2} className='w-[85%] mx-auto' />}
                        {question.image_3 !== "" && <img src={APP_URL + question.image_3} className='w-[85%] mx-auto' />}
                    </div>

                    <div >
                        {question.subQues.map((sub, index) => {
                            return (
                                <AnswerOptions
                                    key={index}
                                    part={question.part}
                                    num={4}
                                    quesInfo={sub}
                                    isGroup={question.isGroup}
                                />
                            )
                        })}
                    </div>

                </div>

                <div className='flex justify-between items-center h-[50px] mt-[10px]'>
                    <div>
                        {
                            question.audio &&
                            <>
                                <div className='flex justify-center col-span-2'>
                                    <audio controls ref={audioRef} className='h-[50px]'>
                                        <source src={APP_URL + question.audio} type="audio/mpeg" />
                                    </audio>
                                </div>
                            </>
                        }
                    </div>

                    <div className='flex items-center'>
                        <button className='qit__btn-func h-[50px] mr-[10px] !bg-red-600' onClick={handleDeleteQuestion}>
                            Delete
                        </button>

                        <button className='qit__btn-func h-[50px]' onClick={(e) => onShow(false)}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function QuesNoGroup({ question, onShow, className, onReloadQuestion }) {
    const audioRef = useRef(null);
    const hasNoImage = question.image_1 === "" && question.image_2 === "" && question.image_3 === "";

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.load()
        }
    }, [question]);

    const handleDeleteQuestion = async () => {
        try {
            let confirmAnswer = confirm("Do you want to delete this question ?");
            if (confirmAnswer) {
                let response = await appClient.delete(`api/QuesToeic/${question.quesId}`);
                let dataRes = response.data;
                if (dataRes.success) {
                    toast({
                        type: "success",
                        title: "Success",
                        message: "Delete question successfully",
                        duration: 4000
                    });

                    onShow(false);
                    onReloadQuestion();
                }
            }
        }
        catch {

        }
    }

    return (
        <div className={`w-full flex justify-center items-center h-full ceq__wrapper ${className}`} onClick={(e) => onShow(false)}>
            <div className='w-full h-full  bg-white flex flex-col ' onClick={(e) => e.stopPropagation()}>
                <div className='grid grid-cols-2 gap-[20px] flex-1 px-[20px]'>
                    {
                        !hasNoImage &&
                        <div>
                            {question.image_1 !== "" && <img src={APP_URL + question.image_1} className='w-full object-contain' />}
                            {question.image_2 !== "" && <img src={APP_URL + question.image_2} className='w-full object-contain' />}
                            {question.image_3 !== "" && <img src={APP_URL + question.image_3} className='w-full object-contain' />}
                        </div>
                    }
                    <div className={`bg-white p-[20px] ${hasNoImage && "col-span-2"}`}>
                        {question.subQues.map((sub, index) => {
                            return (
                                <AnswerOptions
                                    key={index}
                                    part={question.part}
                                    num={question.part == 2 ? 3 : 4}
                                    quesInfo={sub}
                                    isGroup={question.isGroup}
                                />
                            )
                        })}
                    </div>

                </div>

                <div className='flex justify-between items-center min-h-[50px] px-[20px]'>
                    <div>
                        {
                            question.audio &&
                            <>
                                <div className='flex justify-center col-span-2'>
                                    <audio controls preload='auto' ref={audioRef} className='h-[50px]'>
                                        <source src={APP_URL + question.audio} type="audio/mpeg" />
                                    </audio>
                                </div>
                            </>
                        }
                    </div>

                    <div className='flex items-center'>
                        <button className='qit__btn-func h-[50px] mr-[10px] !bg-red-600' onClick={handleDeleteQuestion}>
                            Delete
                        </button>
                        <button className='qit__btn-func h-[50px]' onClick={(e) => onShow(false)}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ToeicAddQuestion