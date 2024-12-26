import React, { memo, useContext, useEffect, useState } from 'react'
import { ExaminationContext } from './InprocessPage';
import { useNavigate } from 'react-router-dom';

function InprocessAnswerSheet({ className, answerSheet, isSubmitted, courseId, onShowSubmitInfo }) {
    const navigate = useNavigate();
    const [isShowAnswerList, setIsShowAnswerList] = useState(false);
    const { question, exam } = useContext(ExaminationContext);
    const [answeredNum, setAnsweredNum] = useState(0);
    const parts = [
        { start: 1, end: 6, title: "Part 1", partNum : 1 },
        { start: 7, end: 31, title: "Part 2", partNum : 2  },
        { start: 32, end: 70, title: "Part 3", partNum : 3  },
        { start: 71, end: 100, title: "Part 4", partNum : 4 },
        { start: 101, end: 130, title: "Part 5", partNum : 5  },
        { start: 131, end: 146, title: "Part 6", partNum : 6 },
        { start: 147, end: 200, title: "Part 7", partNum : 7 },
    ]

    useEffect(() => {
        setAnsweredNum(answerSheet.reduce((acc, item) => {
            return item.answered ? acc + 1 : acc;
        }, 0));
    }, [answerSheet])


    const handleSubmit = () => {
        exam.submit();
    }

    const handleBackToCourse = () => {
        if (courseId) {
            navigate(`/courses/detail/${courseId}`)
        }
        else {
            navigate("/");
        }
        
        localStorage.clear();
        sessionStorage.clear();
    }

    const handleFinishAssignment = () => {
        setIsShowAnswerList(true);
    }

    const handleForwardQues = (item) => {
        question.forward(item.id);
        setIsShowAnswerList(false);
    }

    const handleViewScore = () => {
        onShowSubmitInfo(true);
    }


    console.log(answerSheet);
    return (
        <div className={`${className} bg-white process-info__wrapper h-full flex flex-col`}>
            <div>
                <div className="pi__process-title">Process</div>
                <div className="pi__process-info flex items-center mt-[5px]">
                    <div className="pi__process-current">
                        <span>{answeredNum}</span>
                        <span>/</span>
                        <span>{answerSheet.length}</span>
                    </div>
                    <div className="pi__process-wrapper flex-1 ">
                        <div className='pi__process-bar'>
                            <div className='pi__process-bar-current' style={{ width: answeredNum * 100 / answerSheet.length + "%" }} />
                        </div>
                    </div>
                </div>
            </div>

            <div className='flex justify-between items-center mt-[10px]'>
                <div className='flex items-center'>
                    <div className='w-[15px] h-[15px] bg-blue-400 rounded-[4px] mr-[10px]'></div>
                    <div className='pi__type-text  line-clamp-1 whitespace-nowrap overflow-hidden text-ellipsis'>Answered</div>
                </div>

                <div className='flex items-center'>
                    <div className='w-[15px] h-[15px] border border-blue-400 rounded-[4px] mr-[10px]'></div>
                    <div className='pi__type-text line-clamp-1 whitespace-nowrap overflow-hidden text-ellipsis'>In Process</div>
                </div>

                <div className='flex items-center'>
                    <div className='w-[15px] h-[15px] bg-red-600 rounded-[4px] mr-[10px]'></div>
                    <div className='pi__type-text  line-clamp-1 whitespace-nowrap overflow-hidden text-ellipsis'>Marked</div>
                </div>
            </div>

            <div className='mt-[20px]  flex-1 flex flex-col'>
                <div className="pi__answer-title mb-[10px]">Answer Sheet</div>
                <div className='pi__answer-sheet p-[10px] flex-1'>
                    {
                        parts.map((part, index) => {
                            // const section = answerSheet.filter(item => item.id >= part.start && item.id <= part.end);
                            const section = answerSheet.filter(item => item.part == part.partNum);

                            return (
                                <div key={index}>
                                    {section.length != 0 &&
                                        <>
                                            <div className='pi__answer-part-title' >{part.title}</div>
                                            <div className='pi__answer-sheet p-[10px]'>
                                                {section.map((item, indexSec) => {
                                                    return indexSec % 5 === 0 ?
                                                        <div key={indexSec} className='flex justify-start items-center mb-[10px] overflow-visible pi__answer-row'>
                                                            {section.slice(indexSec, indexSec + 5).map((answer, index) =>
                                                                <AnswerItem key={index} answer={answer} />
                                                            )}
                                                        </div>
                                                        :
                                                        null
                                                })}
                                            </div>
                                        </>
                                    }
                                </div>
                            )
                        })
                    }
                </div>
            </div>

            {
                isShowAnswerList && !isSubmitted &&
                <div className='fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white w-[800px] z-10  rounded-[8px] p-[30px] pi__answer-list-check'>
                    <div className='pia__title'>
                        Answer Sheet Information
                    </div>
                    <div className="pia__table mt-[20px]">
                        <div className="flex justify-between pia__row-header px-[20px]">
                            <div className="cell  w-1/4">
                                Question
                            </div>
                            <div className="cell w-1/4">
                                Answer
                            </div>
                            <div className="cell w-1/4">
                                Status
                            </div>
                            <div className="cell w-1/4">
                                Marked
                            </div>
                        </div>
                        <div className='max-h-[313px] pia__body'>
                            {answerSheet.map((item, index) => {
                                return (
                                    <a key={index} className={`flex items-center px-[20px] py-[15px] pia__row ${!item.answered && "not-answer"} ${item.marked && "marked"}`} onClick={(e) => { handleForwardQues(item) }}>
                                        <div className="cell w-1/4" data-title="Full Name">
                                            {item.id}
                                        </div>
                                        <div className="cell w-1/4" data-title="Age">
                                            {item.userSelected}
                                        </div>
                                        <div className="cell w-1/4" data-title="Job Title">
                                            {item.answered === true ? "Completed" : "Not Answer"}
                                        </div>
                                        <div className="cell w-1/4" data-title="Location">
                                            {item.marked === true ? "Yes" : "No"}
                                        </div>
                                    </a>
                                )
                            })}

                        </div>
                    </div>

                    <div className='mt-[30px] flex justify-end'>
                        <button className='pia__btn mr-[20px]' onClick={handleSubmit}>
                            Submit
                        </button>
                        <button className='pia__btn cancel' onClick={(e) => { setIsShowAnswerList(false) }}>
                            Cancel
                        </button>
                    </div>
                </div>
            }

            <div>
                {!isSubmitted && <button className='pi__answer-submit-btn mt-[20px]' onClick={handleFinishAssignment}>Finish</button>}
                {isSubmitted && <button className='pi__answer-submit-btn view-score mt-[20px]' onClick={handleViewScore}>View Score</button>}
                {isSubmitted && <button className='pi__answer-submit-btn !mt-[10px]' onClick={handleBackToCourse}>Back to course</button>}
            </div>
        </div>
    )
}

function AnswerItem({ answer }) {
    const [currentAnswer, setCurrentAnswer] = useState(answer);
    const { answer: answerModel, question } = useContext(ExaminationContext);

    let answerClass = "";

    if (!answer.answered) {
        answerClass = "not-answer ";
    }

    if (answer?.isCorrect === true) {
        answerClass = "answer-true ";
    }
    if (answer?.isCorrect === false) {
        answerClass = "answer-false ";
        if (answer?.userSelected == null) {
            answerClass = "answer-false-unselect ";
        }
    }

    if (answer.marked) {
        answerClass = answerClass + "marked"
    }


    const handleAnswerClick = () => {
        question.forward(answer.id);
    }

    const handleAnswerDbClick = () => {
        answerModel.marked(answer.id);
    }

    return (
        <button
            className={`pi__answer-btn mr-[10px] ${answerClass}`}
            onClick={handleAnswerClick}
            onDoubleClick={(e) => handleAnswerDbClick(e, answer)}
        >
            {answer.id}
        </button>
    )
}

export default memo(InprocessAnswerSheet)