import React, { memo, useContext, useEffect, useRef, useState } from 'react'
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import { ExaminationContext } from './InprocessPage';

function InprocessQuestion({ className, currentQues, isSubmitted, volume }) {
    const { question } = useContext(ExaminationContext);

    const handlePreviousQues = () => {
        question.previous();
    }

    const handleNextQues = () => {
        question.next();
    }

    return (
        <div className={`${className} question-info__wrapper p-[20px] pt-[10px] w-full flex flex-col `}>
            {
                (currentQues.part >= 5 || isSubmitted === true) &&
                <div className='flex justify-end items-center h-[50px] mb-[5px]'>
                    <button className="qi__btn" onClick={handlePreviousQues}>
                        <img src={IMG_URL_BASE + "left-arrow-white.svg"} className='w-[20px]' />
                    </button>
                    <div className='w-[20px]'></div>
                    <button className="qi__btn" onClick={handleNextQues}>
                        <img src={IMG_URL_BASE + "right-arrow-white.svg"} className='w-[20px]' />
                    </button>
                </div>
            }
            <div className='qi__content block h-full'>
                {currentQues.isGroup == false && <QuesNoGroup question={currentQues} isSubmitted={isSubmitted} volume={volume} />}
                {currentQues.isGroup == true && <QuesGroup question={currentQues} isSubmitted={isSubmitted} volume={volume} />}
            </div>
        </div>
    )
}

function QuesGroup({ question, isSubmitted, volume }) {
    const audioRef = useRef(null);
    const [hasError, setHasError] = useState(false);
    const hasErrorRef = useRef(hasError);
    const { question: quesContext, answer } = useContext(ExaminationContext);
    const isSubmitRef = useRef(isSubmitted);
    const handleEndAudio = () => {
        setTimeout(() => {
            quesContext.next();
        }, 500);
    };

    const handleReloadAudio = () => {
        const answerInfo = answer.getQues(question.quesId);
        if (audioRef.current && answerInfo.replay === 0) {
            audioRef.current.load()
        }
    }

    useEffect(() => {
        hasErrorRef.current = hasError;
    }, [hasError]);


    const handleErrorPlay = (event) => {
        setHasError(true);
    }


    useEffect(() => {
        const answerInfo = answer.getQues(question.quesId);
        const audioElement = audioRef.current;
        setHasError(false);

        const handleCanPlay = () => {
            if (hasErrorRef.current === true) {
                if (answerInfo.replay === 0) {
                    audioElement.muted = false;
                    audioElement.play();
                    answer.replay(question.quesId);
                    setHasError(false);
                }

                return;
            }

            if (answerInfo?.isPlayed == null || answerInfo?.isPlayed == undefined) {
                if (isSubmitRef.current === false) {
                    answer.isPlayed(question.quesId);
                    audioElement.muted = false;
                    audioElement.play();
                }

                setHasError(false);
            }
        };

        const handleDisconnect = (event) => {
            setHasError(true)
        }
        const handleReconnect = (event) => {
            setHasError(false)
        }

        if (audioElement) {
            audioElement.addEventListener('ended', handleEndAudio);
            audioElement.addEventListener('canplaythrough', handleCanPlay);
        }

        window.addEventListener('offline', handleDisconnect);
        window.addEventListener('online', handleReconnect);

        return () => {
            if (audioElement) {
                audioElement.removeEventListener('ended', handleEndAudio);
                audioElement.removeEventListener('canplaythrough', handleCanPlay);
                audioElement.pause();
                audioElement.currentTime = 0;
            }
            window.removeEventListener('offline', handleDisconnect);
            window.removeEventListener('online', handleReconnect);
        };

    }, [question]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.load()
        }
    }, [question.audio]);

    useEffect(() => {
        isSubmitRef.current = isSubmitted
        if (audioRef.current && isSubmitRef.current === true) {
            audioRef.current.pause();
        }

    }, [isSubmitted])

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume])

    return (
        <div className='grid grid-cols-2 gap-[20px] h-full'>
            <div>
                {question.image_1 !== "" && <img src={APP_URL + question.image_1} className='w-[85%] mx-auto' />}
                {question.image_2 !== "" && <img src={APP_URL + question.image_2} className='w-[85%] mx-auto' />}
                {question.image_3 !== "" && <img src={APP_URL + question.image_3} className='w-[85%] mx-auto' />}
            </div>

            <div>
                {question.subQues.map((sub, index) => {
                    return (
                        <AnswerOptions
                            key={index}
                            part={question.part}
                            num={4}
                            quesInfo={sub}
                            isGroup={question.isGroup}
                            isSubmitted={isSubmitted}
                        />
                    )
                })}
            </div>

            {
                question.audio &&
                <>
                    <div className='flex justify-center col-span-2'>
                        <audio controls preload='auto' ref={audioRef} muted={!isSubmitted} onError={handleErrorPlay} className={`${!isSubmitted && "hidden"} w-[400px]`}>
                            <source src={APP_URL + question.audio} type="audio/mpeg" />
                        </audio>
                    </div>

                    {hasError &&
                        <div className='fixed bottom-[54px] left-[50%] translate-x-[-50%]'>
                            <button onClick={handleReloadAudio} className='qi__btn-reload bg-blue-600'>
                                Reload Audio
                                <div className='qi__note-text'>(You can only reload once.)</div>
                            </button>
                        </div>
                    }
                </>
            }

        </div>
    )
}

function QuesNoGroup({ question, isSubmitted, volume }) {
    const audioRef = useRef(null);
    const isSubmitRef = useRef(isSubmitted);
    const [hasError, setHasError] = useState(false);
    const hasErrorRef = useRef(hasError);
    const hasNoImage = question.image_1 === "" && question.image_2 === "" && question.image_3 === "";
    const { question: quesContext, answer } = useContext(ExaminationContext);

    const handleEndAudio = () => {
        setTimeout(() => {
            quesContext.next();
        }, 500);
    };

    const handleReloadAudio = () => {
        const answerInfo = answer.getQues(question.quesId);
        if (audioRef.current && answerInfo.replay === 0) {
            audioRef.current.load()
        }
    }

    useEffect(() => {
        hasErrorRef.current = hasError;
    }, [hasError]);


    const handleErrorPlay = (event) => {
        setHasError(true);
    }


    useEffect(() => {
        const audioElement = audioRef.current;
        const answerInfo = answer.getQues(question.quesId);
        setHasError(false);

        const handleCanPlay = () => {
            if (hasErrorRef.current === true) {
                if (answerInfo.replay === 0) {
                    audioElement.muted = false;
                    audioElement.play();

                    answer.replay(question.quesId);

                    setHasError(false);
                }

                return;
            }

            if (answerInfo?.isPlayed == null || answerInfo?.isPlayed == undefined) {
                if (isSubmitRef.current === false) {
                    answer.isPlayed(question.quesId);
                    audioElement.muted = false;
                    audioElement.play();
                }

                setHasError(false);
            }
        };

        const handleDisconnect = (event) => {
            setHasError(true)
        }
        const handleReconnect = (event) => {
            setHasError(false)
        }

        if (audioRef.current) {
            audioElement.addEventListener('ended', handleEndAudio);
            audioElement.addEventListener('canplaythrough', handleCanPlay);
        }


        window.addEventListener('offline', handleDisconnect);
        window.addEventListener('online', handleReconnect);

        return () => {
            if (audioElement) {
                audioElement.removeEventListener('ended', handleEndAudio);
                audioElement.removeEventListener('canplaythrough', handleCanPlay);
                audioElement.pause();
                audioElement.currentTime = 0;
            }
            window.removeEventListener('offline', handleDisconnect);
            window.removeEventListener('online', handleReconnect);
        };

    }, [question]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.load()
        }
    }, [question.audio]);

    useEffect(() => {
        isSubmitRef.current = isSubmitted;

        if (audioRef.current && isSubmitRef.current === true) {
            audioRef.current.pause();
        }
    }, [isSubmitted])

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume;
        }
    }, [volume])

    return (
        <div className='grid grid-cols-2 gap-[20px] h-full'>
            {
                !hasNoImage &&
                <div>
                    {question.image_1 !== "" && <img src={APP_URL + question.image_1} />}
                    {question.image_2 !== "" && <img src={APP_URL + question.image_2} />}
                    {question.image_3 !== "" && <img src={APP_URL + question.image_3} />}
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
                            isSubmitted={isSubmitted}
                        />
                    )
                })}
            </div>

            {
                question.audio &&
                <>
                    <div className='flex justify-center col-span-2'>
                        <audio controls preload='auto' ref={audioRef} muted={!isSubmitted} onError={handleErrorPlay} className={`${!isSubmitted && "hidden"} w-[400px]`}>
                            <source src={APP_URL + question.audio} type="audio/mpeg" />
                        </audio>
                    </div>

                    {hasError &&
                        <div className='fixed bottom-[54px] left-[50%] translate-x-[-50%]'>
                            <button onClick={handleReloadAudio} className='qi__btn-reload bg-blue-600'>
                                Reload Audio
                                <div className='qi__note-text'>(You can only reload once.)</div>
                            </button>
                        </div>
                    }
                </>
            }
        </div>
    )
}

function AnswerOptions({ part, quesInfo, num, isSubmitted }) {
    const { answer } = useContext(ExaminationContext)
    const [answerItem, setAnswerItem] = useState(() => {
        return answer.get(quesInfo.quesNo);
    });

    useEffect(() => {
        let newAnswerItem = answer.get(quesInfo.quesNo);
        if (answerItem.answerInfo == null && newAnswerItem?.answerInfo) {
            setAnswerItem(newAnswerItem);
        }
    })

    useEffect(() => {
        let newAnswerItem = answer.get(quesInfo.quesNo);
        setAnswerItem(newAnswerItem);
    }, [quesInfo])

    const answerLetter = ["A", "B", "C", "D"];
    const hideQuesOptions = part == 1 || part == 2;

    const handleMarkedQuestion = () => {
        answer.marked(answerItem.id)

        setAnswerItem(prevAnswerItem => prevAnswerItem);
    }

    const handleChangeAnswer = (e) => {
        setAnswerItem({
            ...answerItem,
            userSelected: e.target.value
        });
        answer.change(answerItem.id, e.target.value);
    }

    const handleRemoveAnswer = (e) => {
        setAnswerItem({
            ...answerItem,
            userSelected: null
        });

        answer.change(answerItem.id, null);
    }

    return (
        <div className='mb-[10px] min-h-[180px]'>
            <div className='qi__question inline-block'>
                Question {quesInfo.quesNo}. {quesInfo?.question && !hideQuesOptions && quesInfo.question}
                <button className='ml-[10px] p-[10px] qi__btn-flag inline-block ' onClick={handleMarkedQuestion} >
                    {
                        answerItem.marked ?
                            <img src={IMG_URL_BASE + "flag-mark.svg"} className='w-[15px]' />
                            :
                            <img src={IMG_URL_BASE + "flag.svg"} className='w-[15px]' />
                    }
                </button>
            </div>

            {answerLetter.slice(0, num).map((answer, index) => {
                const answerKey = `answer${answer}`;
                return (
                    <div
                        key={index}
                        className={`qi__rdo-item 
                            ${answer === answerItem?.userSelected && answerItem?.isCorrect === false && isSubmitted && "answer-false "}
                            ${answer === answerItem?.userSelected && answerItem?.isCorrect === true && isSubmitted && "answer-true "}
                            ${isSubmitted && "submitted"}`}>
                        <input
                            type='radio'
                            disabled={isSubmitted}
                            id={`answer-${quesInfo.quesNo}-${answer}`}
                            name={`answer${quesInfo.quesNo}`}
                            value={answer}
                            checked={answerItem?.userSelected === answer}
                            onChange={handleChangeAnswer}
                            onDoubleClick={handleRemoveAnswer}
                        />
                        <label htmlFor={`answer-${quesInfo.quesNo}-${answer}`}>
                            {answer}.
                            {!hideQuesOptions && <span> {quesInfo[answerKey]}</span>}
                        </label>
                    </div>
                )
            })}

            {isSubmitted == true && answerItem.answerInfo && <ResultInfo quesInfo={quesInfo} answerItem={answerItem} part={part} />}
        </div>
    )
}

function ResultInfo({ quesInfo, answerItem, part }) {
    const isRenderQues = part == 1 || part == 2;
    const answerLetter = ["A", "B", "C", "D"];

    return (
        <div>

            {isRenderQues &&
                <div className='mb-[10px]'>
                    <div className='qi__question inline-block'>
                        {`Question ${quesInfo.quesNo}. ${quesInfo.question ?? ""}`}
                    </div>

                    {answerLetter.slice(0, part == 2 ? 3 : 4).map((answer, index) => {
                        const answerKey = `answer${answer}`;
                        return (
                            <div key={index}
                                className={`qi__result-rdo-item ${answerItem.answerInfo.correctAnswer === answer && "answer-true"}`}>
                                <input
                                    disabled={true}
                                    type='radio'
                                    checked={answerItem.answerInfo.correctAnswer === answer}
                                />
                                <label >
                                    {answer}. <span>{quesInfo[answerKey]}</span>
                                </label>
                            </div>
                        )
                    })}
                </div>
            }

            <div className='qi__question inline-block'>
                {`Question ${quesInfo.quesNo}. ${answerItem.answerInfo.question ?? ""}`}
            </div>

            {answerLetter.slice(0, part == 2 ? 3 : 4).map((answer, index) => {
                const answerKey = `answer${answer}`;
                return (
                    <div key={index}
                        className={`qi__result-rdo-item ${answerItem.answerInfo.correctAnswer === answer && "answer-true"}`}>
                        <input
                            disabled={true}
                            type='radio'
                            checked={answerItem.answerInfo.correctAnswer === answer}
                        />
                        <label >
                            {answer}. <span>{answerItem.answerInfo[answerKey]}</span>
                        </label>
                    </div>
                )
            })}

            {answerItem?.answerInfo?.explanation &&
                <div className='qi__question-explaination'>
                    <span className='qi__explaination--title'>Explanation: </span>
                    {answerItem.answerInfo.explanation}
                </div>
            }
        </div>
    )
}

export default memo(InprocessQuestion)