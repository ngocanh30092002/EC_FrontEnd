import toast from '@/helper/Toast';
import React, { createContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import LoaderPage from '../../LoaderComponent/LoaderPage';
import ExamFooter from '../ExamFooter';
import ExamHeader from '../ExamHeader';
import InprocessAnswerSheet from './InprocessAnswerSheet';
import InprocessDirection from './InprocessDirection';
import InprocessQuestion from './InprocessQuestion';
import InprocessSubmitInfo from './InprocessSubmitInfo';
import InprocessVolumn from './InprocessVolumn';

export const ExaminationContext = createContext();

function InprocessPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const lastType = useRef(null);
    const params = new URLSearchParams(location.search);
    const [isLoading, setIsLoading] = useState(false);
    const [isShowSubmitInfo, setIsShowSubmitInfo] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(() => {
        if (location?.state?.isToeicMode) {
            const isSubmitted = sessionStorage.getItem("is-submitted");
            return isSubmitted === "true";
        }

        return false;
    });
    const [questions, setQuestions] = useState(location?.state?.ques)
    const [direction, setDirection] = useState(() => {
        const directionObj = sessionStorage.getItem("direction");
        if (!directionObj) {
            if (location?.state?.direction == null) {
                return null;
            }

            sessionStorage.setItem("direction", JSON.stringify(location?.state?.direction));
            return location?.state?.direction;
        }

        return JSON.parse(directionObj);
    })
    const [userInfo, setUserInfo] = useState(location?.state?.userInfo);
    const [isToeicMode, setIsToeicMode] = useState(location?.state?.isToeicMode)
    const [isShowAnswerSheet, setShowAnswerSheet] = useState(true);
    const [isPaused, setIsPaused] = useState(false);
    const [isHideCountDown, setIsHideCountDown] = useState(() => {
        return params.get("mode") == "view-answer";
    });
    const [isShowDirection, setIsShowDirection] = useState(false);
    const [answerSheet, setAnswerSheet] = useState(() => {
        let answers = sessionStorage.getItem("answer-sheet-toeic");
        if (answers) {
            return JSON.parse(answers);
        }

        let i = 1;
        return questions.flatMap(ques => {
            return ques.subQues.map((item) => {
                return ({
                    id: i++,
                    quesId: ques.quesId,
                    subQueId: item.subId,
                    answered: false,
                    marked: false,
                    userSelected: null,
                    replay: 0
                })
            });
        })
    })

    const [currentIndexQues, setCurrentIndexQues] = useState(() => {
        let quesIndex = sessionStorage.getItem("quesIndex");
        if (!quesIndex) {
            sessionStorage.setItem("quesIndex", 0);
            return 0;
        }

        return parseInt(quesIndex);
    })
    const [volume, setVolume] = useState(location.state?.volume ?? 1);

    const [attemptId, setAttemptId] = useState(() => {
        if(location.state?.attemptId){
            return location.state.attemptId;
        }

        const toeicAttempt = sessionStorage.getItem("toeic-attempt");
        return toeicAttempt ? parseInt(toeicAttempt) : null;
    })

    const isBlockingRef = useRef(true);
    const isSubmittedRef = useRef(isSubmitted);

    useEffect(() => {
        if (params.get("mode") != "view-answer") {
            if (direction == null) {
                navigate("/access-denied");
            }
        }
        if (questions == null || userInfo == null) {
            navigate("/access-denied");
        }
    }, [])

    useEffect(() => {
        const getIsSubmitted = () => {
            if (userInfo?.processId) {
                appClient.get(`api/LearningProcesses/${userInfo.processId}/is-submitted`)
                    .then(res => res.data)
                    .then((data) => {
                        if (data.success) {
                            setIsSubmitted(data.message);
                        }
                    })
                    .catch(() => {
                        setIsSubmitted(false);
                    })
            }
            else {
                navigate(-1);
                toast({
                    type: "error",
                    title: "Error",
                    message: "You can't do it anymore",
                    duration: 4000
                })
            }
        };

        if (!isToeicMode) {
            getIsSubmitted();
        }
        else {
            if (params.get("mode") == "view-answer") {
                setIsSubmitted(true);
            }
            else {
                const isSubmitted = sessionStorage.getItem("is-submitted");
                setIsSubmitted(isSubmitted === "true");
            }
        }
    }, [])

    useEffect(() => {
        if (params.get("mode") == "view-answer") {
            const getResultExam = () => {
                appClient.get(`api/ToeicRecords/processes/${userInfo.processId}/result`)
                    .then(res => res.data)
                    .then(data => {
                        if (data.success) {
                            handleAddResult(data.message)
                        }
                    })
            }

            const getResultToeic = () => {
                appClient.get(`api/ToeicPractice/attempt/${attemptId}/result-answer`)
                    .then(res => res.data)
                    .then(data => {
                        if (data.success) {
                            handleAddResult(data.message)
                        }
                    })
            }

            if (isToeicMode) {
                getResultToeic();
            }
            else {
                getResultExam();
            }


            setIsShowSubmitInfo(true);
        }
    }, [])

    useEffect(() => {
        const handleWarningBeforeReload = (event) => {
            if (isSubmittedRef.current == true) {
                alert("hi");
                localStorage.clear();
                sessionStorage.clear();
            }
            if (isBlockingRef.current) {
                const confirmationMessage = "Are you sure you want to leave? Your changes may not be saved.";
                event.returnValue = confirmationMessage;
                return confirmationMessage;
            }
        }

        const handlePopState = () => {
            if (isSubmittedRef.current == true) {
                localStorage.clear();
                sessionStorage.clear();
            }
        };

        window.addEventListener('popstate', handlePopState);
        window.addEventListener('beforeunload', handleWarningBeforeReload);
        return () => {
            window.removeEventListener('beforeunload', handleWarningBeforeReload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [])

    useEffect(() => {
        sessionStorage.setItem("answer-sheet-toeic", JSON.stringify(answerSheet));
    }, [answerSheet])

    useEffect(() => {
        sessionStorage.setItem("quesIndex", currentIndexQues);

        if (lastType.current != questions[currentIndexQues].part) {
            const propertyName = "isPlayed_" + questions[currentIndexQues].part;
            if (direction != null) {
                if (!direction?.[propertyName]) {
                    setIsShowDirection(true);
                    direction[propertyName] = true;
                }
                lastType.current = questions[currentIndexQues].part;
            }
        }
    }, [currentIndexQues])

    useEffect(() => {
        if (isShowDirection == true) {
            sessionStorage.setItem("direction", JSON.stringify(direction));
        }
    }, [isShowDirection])

    useLayoutEffect(() => {
        if (isSubmitted == true) {
            handlePause();
            isBlockingRef.current = false;
        }

        isSubmittedRef.current = isSubmitted;

        if (isToeicMode) {
            sessionStorage.setItem("is-submitted", isSubmitted);
        }

        return () => {
            if (isSubmittedRef.current === true) {
                sessionStorage.clear();
                localStorage.clear();
            }
        }
    }, [isSubmitted])

    useEffect(() => {
        if (attemptId) {
            sessionStorage.setItem("toeic-attempt", attemptId);
        }
    }, [attemptId])

    const handleShowAnswerSheet = () => {
        setShowAnswerSheet(!isShowAnswerSheet);
    }

    const handleGetAnswer = (id) => {
        let item = answerSheet.find(a => a.id === id);
        return item;
    }

    const handleMarkedAnswer = (id) => {
        const newAnswerSheet = answerSheet.map((item) => {
            if (item.id === id) {
                item.marked = !item.marked;
            }

            return item;
        })

        setAnswerSheet([...newAnswerSheet]);
    }

    const handleChangeAnswer = (id, value) => {
        const newAnswerSheet = answerSheet.map((item) => {
            if (item.id === id) {
                item.answered = value == null ? false : true;
                item.userSelected = value;
            }

            return item;
        })

        setAnswerSheet([...newAnswerSheet]);
    }

    const handleGetQuesAnswer = (quesId) => {
        let item = answerSheet.find(a => a.quesId == quesId);
        return item;
    }

    const handleAddResult = (data) => {
        const newAnswerSheet = answerSheet.map((item, index) => {
            let dataItem = data.find(a => a.subQueId == item.subQueId);
            item.isCorrect = dataItem.isCorrect;
            item.userSelected = dataItem.selectedAnswer;
            item.answerInfo = dataItem.answerInfo;

            return item;
        })

        setAnswerSheet([...newAnswerSheet]);
        setVolume(vol => vol - 0.1);

        setTimeout(() => {
            setVolume(vol => vol + 0.1);
        }, (1000));
    }

    const handleSetPlayVideo = (quesId) => {
        const answers = answerSheet.filter(a => a.quesId == quesId);

        const newAnswerSheet = answerSheet.map((item) => {
            const isExist = answers.some(a => a.id == item.id);
            if (isExist) {
                return {
                    ...item,
                    isPlayed: true
                }
            }

            return item;
        })

        setAnswerSheet([...newAnswerSheet]);
    }

    const handleIncreaseReplay = (quesId) => {
        const answers = answerSheet.filter(a => a.quesId == quesId);
        const newAnswerSheet = answerSheet.map((item) => {
            const isExist = answers.some(a => a.id == item.id);
            if (isExist) {
                item.replay = item.replay + 1;
            }

            return item;
        })

        setAnswerSheet([...newAnswerSheet]);
    }

    const handleNextQuestion = () => {
        const audio = document.querySelector("audio");
        const isPlaying = !audio?.paused;
        if (audio && isPlaying === true && isSubmitted == false) {
            return;
        }

        setIsShowDirection(prev => false);
        setCurrentIndexQues(prev => {
            return prev + 1 > questions.length - 1 ? prev : prev + 1;
        });

    }

    const handlePreviousQuestion = () => {
        const audio = document.querySelector("audio");
        const isPlaying = !audio?.paused;
        if (audio && isPlaying && isSubmitted == false) {
            return;
        }

        setIsShowDirection(false);

        setCurrentIndexQues(prev => {
            return prev - 1 < 0 ? prev : prev - 1;
        });
    }

    const handleForwardQuestion = (quesNo) => {
        const audio = document.querySelector("audio");
        const isPlaying = !audio?.paused;
        if (audio && isPlaying && isSubmitted == false) {
            return;
        }

        const quesIndex = questions.findIndex((a) => {
            let isExist = a.subQues.find(s => s.quesNo === quesNo);
            return !!isExist;
        })
        setIsShowDirection(false);
        setCurrentIndexQues(quesIndex);
    }

    const handlePause = () => {
        setIsPaused(true);
    }
    const handleResume = () => {
        setIsPaused(false);
    }
    const handleHideClock = () => {
        setIsHideCountDown(true);
    }
    const handleShowClock = () => {
        setIsHideCountDown(false);
    }

    const handleSetShowSubmitInfo = (data) => {
        setIsShowSubmitInfo(data);
    }




    const handleSubmitExamination = (isTimeOut = false) => {
        const handleSubmitWithProcess = async () => {
            try {
                const formData = new FormData();
                formData.append("ExamId", userInfo.examination.examId);

                answerSheet.forEach((item, index) => {
                    formData.append(`ToeicRecords[${index}][processId]`, userInfo.processId);
                    formData.append(`ToeicRecords[${index}][subId]`, item.subQueId);
                    if (item.userSelected) {
                        formData.append(`ToeicRecords[${index}][selectedAnswer]`, item.userSelected);
                    }
                });

                setIsLoading(prev => true);
                const response = await appClient.put(`api/learningprocesses/${userInfo.processId}/submit`, formData)
                const data = response.data;
                if (data.success) {
                    setIsShowSubmitInfo(true);
                    setIsSubmitted(true);
                    setIsLoading(prev => false);
                }
            }
            catch {

            }
        }

        const handleSubmitWithToeic = async () => {
            try {
                setIsLoading(prev => true);
                const formDataCreate = new FormData();
                formDataCreate.append("ToeicId", userInfo.toeicInfo.toeicId)

                const resposne = await appClient.post(`api/ToeicAttempts`, formDataCreate);
                const attemptId = resposne.data.message;
                setAttemptId(attemptId);

                const formData = new FormData();
                answerSheet.forEach((item, index) => {
                    formData.append(`PracticeRecords[${index}][SubId]`, item.subQueId);
                    formData.append(`PracticeRecords[${index}][AttemptId]`, attemptId);
                    if (item.userSelected) {
                        formData.append(`PracticeRecords[${index}][SelectedAnswer]`, item.userSelected);
                    }
                });

                const response = await appClient.put(`api/ToeicAttempts/${attemptId}/submit`, formData)
                const data = response.data;
                if (data.success) {
                    setIsShowSubmitInfo(true);
                    setIsSubmitted(true);
                    setIsLoading(prev => false);
                }
            }
            catch {

            }
        }

        if (!isTimeOut) {
            let isExistNotAnswer = answerSheet.some(a => a.answered === false);
            let isMarkedAnswer = answerSheet.some(a => a.marked === true);
            if (isExistNotAnswer) {
                let confirmAnswer = confirm("You still have unanswered questions, are you sure you want to submit?");
                if (confirmAnswer === false) return;
            }
            else if (isMarkedAnswer) {
                let confirmAnswer = confirm("You still have questions marked, Do you want to submit now?");
                if (confirmAnswer === false) return;
            }
        }

        if (params.get("mode") !== "view-answer") {
            if (!isToeicMode) {
                handleSubmitWithProcess();
            }
            else {
                handleSubmitWithToeic();
            }
        }
    }

    const [ExamData, setExamData] = useState({
        answer: {
            get: handleGetAnswer,
            getQues: handleGetQuesAnswer,
            marked: handleMarkedAnswer,
            change: handleChangeAnswer,
            isPlayed: handleSetPlayVideo,
            replay: handleIncreaseReplay,
            addResult: handleAddResult
        },
        question: {
            next: handleNextQuestion,
            previous: handlePreviousQuestion,
            forward: handleForwardQuestion,
        },
        countDown: {
            pause: handlePause,
            resume: handleResume,
            hide: handleHideClock,
            show: handleShowClock
        },
        exam: {
            submit: handleSubmitExamination
        }
    })

    return (
        <ExaminationContext.Provider value={ExamData}>
            <div className='h-screen bg-gray-400'>
                <ExamHeader
                    isProcess={true}
                    countDownTime={"02:00:00"}
                    onShowAnswerSheet={handleShowAnswerSheet}
                    isPaused={isPaused}
                    isHideCountDown={isHideCountDown}
                    isSubmitted={isSubmitted}
                />
                <div className='flex h-full p-[10px] overflow-hidden'>
                    {
                        (isShowDirection && direction != null && isSubmitted == false) ?
                            <InprocessDirection
                                className={"flex-1 bg-white rounded-[8px]"}
                                direction={direction}
                                lastType={lastType.current}
                                onShowDirection={setIsShowDirection}
                                volume={volume}
                            />
                            :
                            <InprocessQuestion
                                className={"flex-1"}
                                currentQues={questions[currentIndexQues]}
                                isSubmitted={isSubmitted}
                                volume={volume}
                            />
                    }

                    <InprocessAnswerSheet
                        className={`ml-[10px] ${!isShowAnswerSheet && "!max-w-0 opacity-0 translate-x-[100%] !p-0 !ml-[0]"}`}
                        answerSheet={answerSheet}
                        isSubmitted={isSubmitted}
                        courseId={userInfo?.class?.courseId}
                        onShowSubmitInfo={handleSetShowSubmitInfo}
                    />
                </div>
                <ExamFooter isFixed={false} />

                {isShowSubmitInfo &&
                    <InprocessSubmitInfo
                        onShowSubmitInfo={handleSetShowSubmitInfo}
                        userInfo={userInfo}
                        isToeicMode={isToeicMode}
                        attemptId={attemptId}
                    />}

                {isSubmitted == false && <InprocessVolumn onSetVolume={setVolume} volume={volume} />}

                {
                    isLoading == true &&
                    <div className='fixed top-0 left-0 w-full h-screen bg-white z-[100]'>
                        <LoaderPage />
                    </div>
                }
            </div>
        </ExaminationContext.Provider>
    )
}

export default InprocessPage