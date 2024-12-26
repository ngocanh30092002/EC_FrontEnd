import React, { memo, useContext, useEffect, useRef, useState } from 'react';
import { APP_URL, IMG_URL_BASE } from '~/GlobalConstant.js';
import { InProcessContext } from './InProcessAssignPage';

function InProcessQues({ className, currentQues, ...props }) {
    const [isMarked, setIsMarked] = useState(false);
    const { question } = useContext(InProcessContext);
    let isLcQues = false;
    if (currentQues?.type === "Image" || currentQues?.type === "Audio" || currentQues?.type === "Conversation") {
        isLcQues = true;
    }

    const handlePreviousQues = () => {
        question.previous();
    }

    const handleNextQues = () => {
        question.next();
    }
    return (
        <div className={`${className} question-info__wrapper p-[20px] pt-[10px] w-full overflow-hidden flex flex-col `}>
            {(!isLcQues || props.isSubmitted) && (
                <div className='flex justify-end items-center h-[50px] mb-[5px]'>
                    <button className="qi__btn" onClick={handlePreviousQues}>
                        <img src={IMG_URL_BASE + "left-arrow-white.svg"} className='w-[20px]' />
                    </button>
                    <div className='w-[20px]'></div>
                    <button className="qi__btn" onClick={handleNextQues}>
                        <img src={IMG_URL_BASE + "right-arrow-white.svg"} className='w-[20px]' />
                    </button>
                </div>
            )}

            <div className={`qi__content block h-full`}>
                {currentQues?.type === "Image" && <QuesImage data={currentQues} isSubmitted={props.isSubmitted} volume={props.volume} />}
                {currentQues?.type === "Audio" && <QuesAudio data={currentQues} isSubmitted={props.isSubmitted} volume={props.volume} />}
                {currentQues?.type === "Conversation" && <QuesConversation data={currentQues} isSubmitted={props.isSubmitted} volume={props.volume} />}
                {currentQues?.type === "Sentence" && <QuesSentence data={currentQues} isSubmitted={props.isSubmitted} volume={props.volume} />}
                {currentQues?.type === "Single" && <QuesSingle data={currentQues} isSubmitted={props.isSubmitted} volume={props.volume} />}
                {currentQues?.type === "Double" && <QuesDouble data={currentQues} isSubmitted={props.isSubmitted} volume={props.volume} />}
                {currentQues?.type === "Triple" && <QuesTriple data={currentQues} isSubmitted={props.isSubmitted} volume={props.volume} />}
            </div>
        </div>
    )
}


function QuesImage({ data, isSubmitted, volume }) {
    const { question, answer } = useContext(InProcessContext);
    const [hasError, setHasError] = useState(false);
    let hasErrorRef = useRef(hasError);
    const audioRef = useRef(null);

    const handleEndAudio = () => {
        setTimeout(() => {
            question.next();
        }, 500);
    };

    useEffect(() => {
        hasErrorRef.current = hasError;
    }, [hasError]);

    const handleErrorPlay = (event) => {
        setHasError(true);
    }

    const handleReloadAudio = () => {
        const answerInfo = answer.get(data.assignQuesId, true);

        if (audioRef.current && answerInfo.replay === 0) {
            audioRef.current.load()
        }
    }

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
    }, [isSubmitted])

    useEffect(() => {
        const audioElement = audioRef.current;
        const answerInfo = answer.get(data.quesNo);
        setHasError(false);

        audioElement.addEventListener('ended', handleEndAudio);

        const handleCanPlay = () => {
            if (hasErrorRef.current === true) {
                if (answerInfo.replay === 0) {
                    setTimeout(() => {
                        data.isPlayed = true;
                        audioElement.muted = false;
                        audioElement.play();
                    }, 500);

                    answer.replay(data.assignQuesId, true);

                    setHasError(false);
                }

                return;
            }

            if (answerInfo?.isPlayed == null || answerInfo?.isPlayed == undefined) {
                answer.isPlayed(data.quesNo);

                if (isSubmitted === false) {
                    setTimeout(() => {
                        data.isPlayed = true;
                        audioElement.muted = false;
                        audioElement.play();
                    }, 500);
                }
            }
        };

        const handleDisconnect = (event) => {
            setHasError(true)
        }
        const handleReconnect = (event) => {
            setHasError(false)
        }


        audioElement.addEventListener('canplaythrough', handleCanPlay);
        window.addEventListener('offline', handleDisconnect);
        window.addEventListener('online', handleReconnect);


        return () => {
            audioElement.removeEventListener('ended', handleEndAudio);
            audioElement.removeEventListener('canplaythrough', handleCanPlay);
            window.removeEventListener('offline', handleDisconnect);
            window.removeEventListener('online', handleReconnect);

            if (audioElement) {
                audioElement.pause();
                audioElement.currentTime = 0;
            }
        };

    }, [data]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.load();
        }
    }, [data.quesInfo?.audioUrl]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume
        }
    }, [volume])

    return (
        <div className='grid grid-cols-2 gap-[20px] h-full'>
            <div className='bg-white '>
                <img src={APP_URL + data.quesInfo.imageUrl} />
            </div>

            <div className='bg-white p-[20px]'>
                <AnswerOptions type={"no-ques"} num={4} answerInfo={data} isSubmitted={isSubmitted} volume={volume} />
            </div>

            {hasError &&
                <div className='fixed bottom-[54px] left-[50%] translate-x-[-50%]'>
                    <button onClick={handleReloadAudio} className='qi__btn-reload bg-blue-600'>
                        Reload Audio
                        <div className='qi__note-text'>(You can only reload once.)</div>
                    </button>
                </div>
            }

            <audio controls preload='auto' ref={audioRef} muted={!isSubmitted} onError={handleErrorPlay} className={`${!isSubmitted && "hidden"}`}>
                <source src={APP_URL + data.quesInfo?.audioUrl} type="audio/mpeg" />
            </audio>
        </div>
    )
}

function QuesAudio({ data, isSubmitted, volume }) {
    const { question, answer } = useContext(InProcessContext);
    const [hasError, setHasError] = useState(false);
    let hasErrorRef = useRef(hasError);
    const audioRef = useRef(null);

    const handleEndAudio = () => {
        setTimeout(() => {
            question.next();
        }, 500);
    };

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
    }, [isSubmitted])

    useEffect(() => {
        hasErrorRef.current = hasError;
    }, [hasError]);

    const handleErrorPlay = (event) => {
        setHasError(true);
    }

    const handleReloadAudio = () => {
        const answerInfo = answer.get(data.assignQuesId, true);

        if (audioRef.current && answerInfo.replay === 0) {
            audioRef.current.load()
        }
    }


    useEffect(() => {
        const audioElement = audioRef.current;
        const answerInfo = answer.get(data.quesNo);
        setHasError(false);

        audioElement.addEventListener('ended', handleEndAudio);

        const handleCanPlay = () => {
            if (hasErrorRef.current === true) {
                if (answerInfo.replay === 0) {
                    setTimeout(() => {
                        data.isPlayed = true;
                        audioElement.muted = false;
                        audioElement.play();
                    }, 500);

                    answer.replay(data.assignQuesId, true);

                    setHasError(false);
                }

                return;
            }

            if (answerInfo?.isPlayed == null || answerInfo?.isPlayed == undefined) {
                answer.isPlayed(data.quesNo);

                if (isSubmitted === false) {
                    setTimeout(() => {
                        data.isPlayed = true;
                        audioElement.muted = false;
                        audioElement.play();
                    }, 500);
                }
            }
        };

        const handleDisconnect = (event) => {
            setHasError(true)
        }
        const handleReconnect = (event) => {
            setHasError(false)
        }


        audioElement.addEventListener('canplaythrough', handleCanPlay);
        window.addEventListener('offline', handleDisconnect);
        window.addEventListener('online', handleReconnect);


        return () => {
            audioElement.removeEventListener('ended', handleEndAudio);
            audioElement.removeEventListener('canplaythrough', handleCanPlay);
            window.removeEventListener('offline', handleDisconnect);
            window.removeEventListener('online', handleReconnect);

            if (audioElement) {
                audioElement.pause();
                audioElement.currentTime = 0;
            }
        };

    }, [data]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.load();
        }
    }, [data.quesInfo?.audioUrl]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume
        }
    }, [volume])

    return (
        <div className='h-full pl-[0px]'>
            <AnswerOptions type={"audio"} num={3} answerInfo={data} isSubmitted={isSubmitted} volume={volume} />

            {hasError &&
                <div className='fixed bottom-[54px] left-[50%] translate-x-[-50%]'>
                    <button onClick={handleReloadAudio} className='qi__btn-reload bg-blue-600'>
                        Reload Audio
                        <div className='qi__note-text'>(You can only reload once.)</div>
                    </button>
                </div>
            }


            <audio controls preload='auto' ref={audioRef} muted={!isSubmitted} onError={handleErrorPlay} className={`${!isSubmitted && "hidden"}`}>
                <source src={APP_URL + data.quesInfo?.audioUrl} type="audio/mpeg" />
            </audio>

        </div>
    )
}

function QuesConversation({ data, isSubmitted, volume }) {
    const audioRef = useRef(null);
    const [questions, setQuestions] = useState(data.quesInfo.questions);
    const { question, answer } = useContext(InProcessContext);
    const [hasError, setHasError] = useState(false);
    let hasErrorRef = useRef(hasError);

    const handleEndAudio = () => {
        setTimeout(() => {
            question.next();
        }, 500);
    };

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.pause();
        }
    }, [isSubmitted])

    useEffect(() => {
        hasErrorRef.current = hasError;
    }, [hasError]);

    const handleErrorPlay = (event) => {
        setHasError(true);
    }

    const handleReloadAudio = () => {
        const answerInfo = answer.get(data.assignQuesId, true);

        if (audioRef.current && answerInfo.replay === 0) {
            audioRef.current.load()
        }
    }

    useEffect(() => {
        const audioElement = audioRef.current;
        const answerInfo = answer.get(data.assignQuesId, true);
        setHasError(false);
        audioElement.addEventListener('ended', handleEndAudio);

        const handleCanPlay = () => {

            if (hasErrorRef.current === true) {
                if (answerInfo.replay === 0) {
                    setTimeout(() => {
                        data.isPlayed = true;
                        audioElement.muted = false;
                        audioElement.play();
                    }, 500);

                    answer.replay(data.assignQuesId, true);

                    setHasError(false);
                }

                return;
            }

            if (answerInfo?.isPlayed == null || answerInfo?.isPlayed == undefined) {
                answer.isPlayed(data.assignQuesId, true);
                if (isSubmitted === false) {
                    setTimeout(() => {
                        data.isPlayed = true;
                        audioElement.muted = false;
                        audioElement.play();
                    }, 500);
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

        audioElement.addEventListener('canplaythrough', handleCanPlay);
        window.addEventListener('offline', handleDisconnect);
        window.addEventListener('online', handleReconnect);

        return () => {
            audioElement.removeEventListener('ended', handleEndAudio);
            audioElement.removeEventListener('canplaythrough', handleCanPlay);
            window.removeEventListener('offline', handleDisconnect);
            window.removeEventListener('online', handleReconnect);

            if (audioElement) {
                audioElement.pause();
                audioElement.currentTime = 0;
            }
        };

    }, [data]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.load()
        }
    }, [data.quesInfo?.audioUrl]);

    useEffect(() => {
        setQuestions(data.quesInfo.questions);
    }, data.quesInfo.questions)

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = volume
        }
    }, [volume])

    return (
        <div className='grid grid-cols-2 h-full pl-[0px]'>
            <div>
                {data.quesInfo.imageUrl !== "" && <img src={APP_URL + data.quesInfo.imageUrl} />}
            </div>
            <div className='bg-white p-[10px]'>
                {questions.map((item, index) => {
                    return (
                        <AnswerOptions key={index} type={"ques"} num={4} answerInfo={item} isSubmitted={isSubmitted} volume={volume} />
                    )
                })}
            </div>
            {hasError &&
                <div className='fixed bottom-[54px] left-[50%] translate-x-[-50%]'>
                    <button onClick={handleReloadAudio} className='qi__btn-reload bg-blue-600'>
                        Reload Audio
                        <div className='qi__note-text'>(You can only reload once.)</div>
                    </button>
                </div>
            }

            <audio controls preload='auto' ref={audioRef} muted={!isSubmitted} onError={handleErrorPlay} className={`${!isSubmitted && "hidden"}`}>
                <source src={APP_URL + data.quesInfo?.audioUrl} type="audio/mpeg" />
            </audio>
        </div>
    )
}

function QuesSentence({ data, isSubmitted, volume }) {
    return (
        <div className='h-full pl-[0px]'>
            <AnswerOptions type={"sentence"} num={4} answerInfo={data} isSubmitted={isSubmitted} volume={volume}/>
        </div>
    )
}

function QuesSingle({ data, isSubmitted, volume }) {
    const [questions, setQuestions] = useState(data.quesInfo.questions);

    return (
        <div className='grid grid-cols-2 h-full pl-[0px]'>
            <div className='flex flex-col items-center ques-image__wrapper'>
                {data.quesInfo.imageUrl !== "" && <img src={APP_URL + data.quesInfo.imageUrl} className='w-full' />}
            </div>
            <div className='bg-white p-[10px]'>
                {questions.map((item, index) => {
                    return (
                        <AnswerOptions key={index} type={"ques"} num={4} answerInfo={item} isSubmitted={isSubmitted} volume={volume}/>
                    )
                })}
            </div>
        </div>
    )
}

function QuesDouble({ data, isSubmitted , volume}) {
    const [questions, setQuestions] = useState(data.quesInfo.questions);


    return (
        <div className='grid grid-cols-2 h-full pl-[0px]'>
            <div className='flex flex-col items-center ques-image__wrapper'>
                {data.quesInfo.imageUrl_1 !== "" && <img src={APP_URL + data.quesInfo.imageUrl_1} className='w-[90%]' />}
                {data.quesInfo.imageUrl_2 !== "" && <img src={APP_URL + data.quesInfo.imageUrl_2} className='w-[90%]' />}
            </div>
            <div className='bg-white p-[10px]'>
                {questions.map((item, index) => {
                    return (
                        <AnswerOptions key={index} type={"ques"} num={4} answerInfo={item} isSubmitted={isSubmitted} volume={volume}/>
                    )
                })}
            </div>
        </div>
    )
}

function QuesTriple({ data, isSubmitted, volume }) {
    const [questions, setQuestions] = useState(data.quesInfo.questions);

    return (
        <div className='grid grid-cols-2 h-full pl-[0px]'>
            <div className='ques-image__wrapper'>
                {data.quesInfo.imageUrl_1 !== "" && <img className='w-[80%]' src={APP_URL + data.quesInfo.imageUrl_1} />}
                {data.quesInfo.imageUrl_2 !== "" && <img className='w-[80%]' src={APP_URL + data.quesInfo.imageUrl_2} />}
                {data.quesInfo.imageUrl_3 !== "" && <img className='w-[80%]' src={APP_URL + data.quesInfo.imageUrl_3} />}
            </div>
            <div className='bg-white p-[10px]'>
                {questions.map((item, index) => {
                    return (
                        <AnswerOptions key={index} type={"ques"} num={4} answerInfo={item} isSubmitted={isSubmitted}  volume={volume}/>
                    )
                })}
            </div>
        </div>
    )
}

function AnswerOptions({ answerInfo, type, num, isShowAnswer = false, isSubmitted, volume }) {
    const [answerOptionInfo, setAnswerOptionInfo] = useState(null);
    const [resultInfo, setResultInfo] = useState([null]);

    const answerLetter = ["A", "B", "C", "D"];
    const { answer } = useContext(InProcessContext);

    useEffect(() => {
        let newAnswerOptions = answer.get(answerInfo.quesNo);
        if (answerOptionInfo?.answerInfo == null && newAnswerOptions?.answerInfo) {
            setAnswerOptionInfo(newAnswerOptions);
            setResultInfo(newAnswerOptions?.answerInfo);
        }
    })
    useEffect(() => {
        let answerOptionInfo = answer.get(answerInfo.quesNo);
        setAnswerOptionInfo(answerOptionInfo);
        setResultInfo(answerOptionInfo?.answerInfo);
    }, [answerInfo])

    useEffect(() =>{
        let newAnswerOptions = answer.get(answerInfo.quesNo);
        setAnswerOptionInfo(newAnswerOptions);
        setResultInfo(newAnswerOptions?.answerInfo);
    }, [volume])

    const handleChangeAnswer = (e) => {
        setAnswerOptionInfo({
            ...answerOptionInfo,
            userSelected: e.target.value
        });
        answer.change(answerInfo.quesNo, e.target.value);
    }

    const handleRemoveAnswer = (e) => {
        setAnswerOptionInfo({
            ...answerOptionInfo,
            userSelected: null
        });

        answer.remove(answerInfo.quesNo);
    }

    const handleMarkedQues = (e) => {
        setAnswerOptionInfo({
            ...answerOptionInfo,
            marked: !answerOptionInfo.marked
        });
        answer.marked(answerInfo.quesNo);
    }

    return (
        <div className='mb-[10px]'>
            <div className=''>
                {(type === "no-ques" || type === "audio") &&
                    <div className='qi__question inline-block'>
                        {`Question ${answerInfo?.quesNo}.`}
                        <button className='ml-[10px] p-[10px] qi__btn-flag inline-block ' onClick={handleMarkedQues}>
                            {answerOptionInfo?.marked ?
                                <img src={IMG_URL_BASE + "flag-mark.svg"} className='w-[15px]' />
                                :
                                <img src={IMG_URL_BASE + "flag.svg"} className='w-[15px]' />
                            }
                        </button>
                    </div>}
                {type === "ques" &&
                    <div className='qi__question inline-block'>
                        {`${answerInfo?.quesNo}. ${answerInfo?.question}`}
                        <button className='ml-[10px] p-[10px] qi__btn-flag inline-block ' onClick={handleMarkedQues}>
                            {answerOptionInfo?.marked ?
                                <img src={IMG_URL_BASE + "flag-mark.svg"} className='w-[15px]' />
                                :
                                <img src={IMG_URL_BASE + "flag.svg"} className='w-[15px]' />
                            }
                        </button>
                    </div>}

                {type === "sentence" &&
                    <div className='qi__question inline-block'>
                        {`${answerInfo?.quesNo}. ${answerInfo.quesInfo.question}`}
                        <button className='ml-[10px] p-[10px] qi__btn-flag inline-block ' onClick={handleMarkedQues}>
                            {answerOptionInfo?.marked ?
                                <img src={IMG_URL_BASE + "flag-mark.svg"} className='w-[15px]' />
                                :
                                <img src={IMG_URL_BASE + "flag.svg"} className='w-[15px]' />
                            }
                        </button>
                    </div>}

            </div>

            {answerLetter.slice(0, num).map((item, index) => {
                const answerKey = `answer${item}`;
                return (
                    <div key={index}
                        className={`qi__rdo-item ${item === answerOptionInfo?.userSelected && answerOptionInfo?.isCorrect === false && isSubmitted && "answer-false"} 
                            ${item === answerOptionInfo?.userSelected && answerOptionInfo?.isCorrect === true && isSubmitted && "answer-true"}
                            
                            `}>
                        <input
                            disabled={isSubmitted}
                            type='radio'
                            id={`answer-${answerInfo.quesNo}-${item}`}
                            name={`answer${answerInfo.quesNo}`}
                            value={item}
                            checked={answerOptionInfo?.userSelected === item}
                            onChange={handleChangeAnswer}
                            onDoubleClick={handleRemoveAnswer}

                        />
                        <label htmlFor={`answer-${answerInfo.quesNo}-${item}`}>
                            {item}
                            {type === "ques" && <span>{answerInfo[answerKey]}</span>}
                            {type === "sentence" && <span>{answerInfo.quesInfo[answerKey]}</span>}
                        </label>
                    </div>
                )
            })}

            {resultInfo && (
                <ResultItem quesNo={answerInfo?.quesNo} type={type} resultInfo={resultInfo} num={num} quesInfo={answerInfo.quesInfo} />
            )}
        </div>
    )
}

function ResultItem({ quesNo, type, num, resultInfo, quesInfo }) {
    const answerLetter = ["A", "B", "C", "D"];
    return (
        <div className='mb-[10px]'>
            <div className=''>
                {type === "no-ques" &&
                    <div className='qi__question inline-block'>
                        {`Question ${quesNo}. ${resultInfo?.question ?? ""}`}
                    </div>
                }
                {type === "ques" &&
                    <div className='qi__question inline-block'>
                        {`${quesNo}. ${resultInfo?.question}`}
                    </div>
                }

                {type === "sentence" &&
                    <div className='qi__question inline-block'>
                        {`${quesNo}. ${resultInfo?.question}`}
                    </div>
                }

                {type === "audio" &&
                    <div className='mb-[10px]'>
                        <div className='qi__question inline-block'>
                            {`Question ${quesNo}. ${quesInfo?.question}`}
                        </div>
                        <div>
                            <div>
                                {answerLetter.slice(0, num).map((item, index) => {
                                    const answerKey = `answer${item}`;
                                    return (
                                        <div key={index}
                                            className={`qi__result-rdo-item ${resultInfo && item === resultInfo.correctAnswer && "answer-true"} `}>
                                            <label >
                                                {item}
                                                <span>{quesInfo[answerKey]}</span>
                                            </label>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                }
            </div>

            {type === "audio" &&
                <div className='qi__question inline-block'>
                    {`Question ${quesNo}. ${resultInfo?.question}`}
                </div>
            }
            {answerLetter.slice(0, num).map((item, index) => {
                const answerKey = `answer${item}`;
                return (
                    <div key={index}
                        className={`qi__result-rdo-item ${resultInfo && item === resultInfo.correctAnswer && "answer-true"} `}>
                        <label >
                            {item}
                            <span>{resultInfo[answerKey]}</span>
                        </label>
                    </div>
                )
            })}

            {resultInfo?.explanation &&
                <div className='qi__question-explaination'>
                    <span className='qi__explaination--title'>Explanation: </span>
                    {resultInfo.explanation}
                </div>
            }
        </div>
    )
}
export default memo(InProcessQues)