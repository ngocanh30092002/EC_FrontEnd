import React, { createContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import AssignmentFooter from '../AssignmentFooter';
import InProcessAnswers from './InProcessAnswers';
import InProcessHeader from './InProcessHeader';
import InProcessQues from './InProcessQues';
import InProcessSubmitInfo from './InProcessSubmitInfo';
import InprocessVolumn from '../../ExamComponent/Inprocess/InprocessVolumn';
import "./InProcessStyle.css";
import "../Overview/OverviewStyle.css";
import LoaderPage from '../../LoaderComponent/LoaderPage';
export const InProcessContext = createContext();

function InProcessAssignPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const isBlockingRef = useRef(true);

    const [volume, setVolume] = useState(1);
    const [userInfo, setUserInfo] = useState(location.state)
    const [isLoading, setIsLoading] = useState(false);
    const [assignQues, setAssignQues] = useState([]);
    const [isShowSubmitInfo, setIsShowSubmitInfo] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const isSubmittedRef = useRef(isSubmitted);

    let [currentIndexQues, setCurrentIndexQues] = useState(() => {
        var quesIndex = sessionStorage.getItem("quesIndex")
        if (!quesIndex) {
            sessionStorage.setItem("quesIndex", 0);
            return 0;
        }

        return quesIndex;
    });
    const [answerSheet, setAnswerSheet] = useState(() => {
        let answerRecords = sessionStorage.getItem("answer-sheet");
        if (answerRecords) {
            return JSON.parse(answerRecords);
        }
        return [];
    });
    const [isShowAnswerSheet, setShowAnswerSheet] = useState(true);
    const params = new URLSearchParams(location.search);

    useEffect(() => {
        if (userInfo == null) {
            navigate("/access-denied");
        }
    }, [])

    useEffect(() => {
        const assignQuesPromise = async () => {
            try {
                const response = await appClient.get(`api/AssignQues/assignments/${userInfo.assignment.assignmentId}`)
                const data = response.data;
                if (data.success) {
                    return data.message;
                }
                return null;
            }
            catch {
                return null;
            }
        };

        assignQuesPromise().then(data => {
            let i = 1;
            if (data) {
                data.map((ques) => {
                    if (ques.quesInfo?.questions) {
                        ques.quesInfo.questions.map(item => {
                            item.quesNo = i++;
                            return item;
                        })
                    }
                    else {
                        return ques.quesNo = i++;
                    }
                })
            }

            setAssignQues(data);

            if (answerSheet.length === 0) {
                i = 1;
                const result = data.flatMap(ques => {
                    if (ques.quesInfo?.questions) {
                        return ques.quesInfo.questions.map((item) => {
                            return ({
                                id: i++,
                                answered: false,
                                marked: false,
                                subQuesId: item.quesId,
                                assignQuesId: ques.assignQuesId,
                                userSelected: null,
                                replay: 0
                            })
                        });
                    }

                    return {
                        id: i++,
                        answered: false,
                        marked: false,
                        subQuesId: null,
                        assignQuesId: ques.assignQuesId,
                        userSelected: null,
                        replay: 0
                    };
                })

                if (params.get("mode") == "view-answer") {
                    const getResult = () => {
                        appClient.get(`api/AssignmentRecords/processes/${userInfo?.processId}/result`)
                            .then(res => res.data)
                            .then(data => {
                                setAnswerSheet(pre => result);
                                handleAddResult(data.message);
                            })
                    }
                    getResult();
                }
                else {
                    setAnswerSheet(result);

                }
            }
        })

        const getIsSubmitted = () => {
            if (userInfo?.processId) {
                appClient.get(`api/LearningProcesses/${userInfo.processId}/is-submitted`)
                    .then((response) => {
                        return response.data;
                    })
                    .then((data) => {
                        if (data.success) {
                            setIsSubmitted(data.message);
                        }
                    })
                    .catch(() => {
                        setIsSubmitted(false);
                    })
            }
        };

        getIsSubmitted();
    }, [])

    useEffect(() => {
        const handleWarningBeforeReload = (event) => {
            if (isSubmittedRef.current == true) {
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

    useLayoutEffect(() => {
        isSubmittedRef.current = isSubmitted;

        if (isSubmittedRef.current == true) {
            isBlockingRef.current = false;
        }

        return () => {
            if (isSubmittedRef.current == true) {
                localStorage.clear();
                sessionStorage.clear();
            }
        }
    }, [isSubmitted])

    useEffect(() => {
        sessionStorage.setItem("quesIndex", currentIndexQues);
    }, [currentIndexQues])

    const handleSetPlayVideo = (id, group = false) => {
        if (!group) {
            setAnswerSheet(oldAnswerSheet => {
                oldAnswerSheet.map((item, index) => {
                    if (item.id === id) {
                        item.isPlayed = true;
                    }

                    return item;
                })

                sessionStorage.setItem("answer-sheet", JSON.stringify([...oldAnswerSheet]));

                return [...oldAnswerSheet];
            });
        }
        else {
            setAnswerSheet(oldAnswerSheet => {
                oldAnswerSheet.map((item, index) => {
                    if (item.assignQuesId === id) {
                        item.isPlayed = true;
                    }

                    return item;
                })

                sessionStorage.setItem("answer-sheet", JSON.stringify([...oldAnswerSheet]));

                return [...oldAnswerSheet];
            });
        }
    }

    const handleIncreaseReplay = (id, group = false) => {
        if (!group) {
            setAnswerSheet(oldAnswerSheet => {
                oldAnswerSheet.map((item, index) => {
                    if (item.id === id) {
                        item.replay = item.replay + 1;
                    }

                    return item;
                })

                sessionStorage.setItem("answer-sheet", JSON.stringify([...oldAnswerSheet]));

                return [...oldAnswerSheet];
            });
        }
        else {
            setAnswerSheet(oldAnswerSheet => {
                oldAnswerSheet.map((item, index) => {
                    if (item.assignQuesId === id) {
                        item.replay = item.replay + 1;
                    }

                    return item;
                })

                sessionStorage.setItem("answer-sheet", JSON.stringify([...oldAnswerSheet]));

                return [...oldAnswerSheet];
            });
        }
    }

    const handleChangeSelectedAnswer = (id, selectedAnswer) => {
        setAnswerSheet(oldAnswerSheet => {
            oldAnswerSheet.map((item, index) => {
                if (item.id === id) {
                    item.answered = true;
                    item.userSelected = selectedAnswer;
                }

                return item;
            })

            sessionStorage.setItem("answer-sheet", JSON.stringify([...oldAnswerSheet]));

            return [...oldAnswerSheet];
        });
    }

    const getAnswer = (id, group = false) => {
        if (group) {
            let item = answerSheet.find(a => a.assignQuesId === id);
            return item;
        }

        let item = answerSheet.find(a => a.id === id);
        return item;
    }

    const handleRemoveSelectedAnswer = (id) => {
        setAnswerSheet(oldAnswerSheet => {
            oldAnswerSheet.map((item, index) => {
                if (item.id === id) {
                    item.answered = false;
                    item.userSelected = null;
                }

                return item;
            })

            sessionStorage.setItem("answer-sheet", JSON.stringify([...oldAnswerSheet]));

            return [...oldAnswerSheet];
        });
    }

    const handleChangeMarkedAnswer = (id) => {
        setAnswerSheet(oldAnswerSheet => {
            oldAnswerSheet.map((item, index) => {
                if (item.id === id) {
                    item.marked = !item.marked;
                }

                return item;
            })

            sessionStorage.setItem("answer-sheet", JSON.stringify([...oldAnswerSheet]));

            return [...oldAnswerSheet];
        });
    }

    const handleShowAnswerSheet = () => {
        setShowAnswerSheet(!isShowAnswerSheet);
    }

    const handleNextQuestion = () => {
        const audio = document.querySelector("audio");
        const isPlaying = !audio?.paused;
        if (audio && isPlaying === true && isSubmitted == false) {
            return;
        }

        setCurrentIndexQues(prev => {
            return prev + 1 > assignQues.length - 1 ? prev : prev + 1;
        });
    }

    const handlePreviousQuestion = () => {
        const audio = document.querySelector("audio");
        const isPlaying = !audio?.paused;
        if (audio && isPlaying === true && isSubmitted == false) {
            return;
        }

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

        const quesIndex = assignQues.findIndex((a) => {
            if (a.quesInfo?.questions) {
                let isExist = a.quesInfo.questions.find(subQues => subQues.quesNo === quesNo);
                return !!isExist;
            }
            else {
                return a.quesNo === quesNo;
            }
        })

        setCurrentIndexQues(quesIndex);

    }

    const handleSubmitAssignment = (isTimeOut = false) => {
        const handleSubmit = async () => {
            try {
                const formData = new FormData();
                formData.append("AssignmentId", userInfo.assignment.assignmentId);

                answerSheet.forEach((item, index) => {
                    formData.append(`AssignmentRecords[${index}][processId]`, userInfo.processId);
                    formData.append(`AssignmentRecords[${index}][assignQuesId]`, item.assignQuesId);
                    if (item?.subQuesId) {
                        formData.append(`AssignmentRecords[${index}][subId]`, item.subQuesId);
                    }
                    if (item.userSelected) {
                        formData.append(`AssignmentRecords[${index}][selectedAnswer]`, item.userSelected);
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

        if (!isTimeOut) {
            let isExistNotAnswer = answerSheet.some(a => a.answered === false);
            let isMarkedAnswer = answerSheet.some(a => a.marked === true);

            if (isExistNotAnswer) {
                let confirmAnswer = confirm("You still have unanswered questions, are you sure you want to submit?");
                if (confirmAnswer) {
                    if (params.get("mode") !== "view-answer") {
                        handleSubmit()
                    }
                }

                return;
            }
            else if (isMarkedAnswer) {
                let confirmAnswer = confirm("You still have questions marked, Do you want to submit now?");
                if (confirmAnswer) {
                    if (params.get("mode") !== "view-answer") {
                        handleSubmit()
                    }
                }

                return;
            }
            else {
                if (params.get("mode") !== "view-answer") {
                    handleSubmit()
                }
                return;
            }
        }

        if (params.get("mode") !== "view-answer") {
            handleSubmit()
        }
    }

    const handleSetShowSubmitInfo = (data) => {
        setIsShowSubmitInfo(data);
    }

    const handleAddResult = (data) => {
        setAnswerSheet(oldAnswerSheet => {
            oldAnswerSheet.map((item, index) => {
                let answerInfo = data.find(a => a.assignQuesId == item.assignQuesId && a.subQueId == item.subQuesId)
                item.isCorrect = answerInfo.isCorrect;
                item.answerInfo = answerInfo.answerInfo;
                item.userSelected = answerInfo.selectedAnswer;
                return item;
            })

            sessionStorage.setItem("answer-sheet", JSON.stringify([...oldAnswerSheet]));

            return [...oldAnswerSheet];
        });
    }

    const InProcessData = {
        answer: {
            change: handleChangeSelectedAnswer,
            remove: handleRemoveSelectedAnswer,
            marked: handleChangeMarkedAnswer,
            get: getAnswer,
            isPlayed: handleSetPlayVideo,
            replay: handleIncreaseReplay,
            addResult: handleAddResult,
        },
        question: {
            next: handleNextQuestion,
            previous: handlePreviousQuestion,
            forward: handleForwardQuestion,
        },
        assignment: {
            submit: handleSubmitAssignment
        }
    }

    return (
        <InProcessContext.Provider value={InProcessData}>
            <div className="h-full">
                <InProcessHeader
                    onShowAnswerList={handleShowAnswerSheet}
                    countDownTime={userInfo.time ?? "00:00:00"}
                    isSubmitted={isSubmitted}
                />

                <div className="flex bg-gray-300 h-full p-[10px]">
                    <InProcessQues
                        className={"flex-1"}
                        currentQues={assignQues[currentIndexQues]}
                        isSubmitted={isSubmitted}
                        volume={volume}
                    />

                    <InProcessAnswers
                        className={`ml-[10px] ${!isShowAnswerSheet && "max-w-0 opacity-0 translate-x-[100%] p-0 !ml-[0]"}`}
                        answerSheet={answerSheet}
                        isSubmitted={isSubmitted}
                        courseId={userInfo?.course}
                    />
                </div>

                <AssignmentFooter isFixed={false} />

                {isShowSubmitInfo && <InProcessSubmitInfo processId={userInfo.processId} onShowSubmitInfo={handleSetShowSubmitInfo} userInfo={userInfo} />}

                <InprocessVolumn onSetVolume={setVolume} volume={volume} />

                {
                    isLoading == true &&
                    <div className='fixed top-0 left-0 w-full h-screen bg-white z-[100]'>
                        <LoaderPage />
                    </div>
                }
            </div>
        </InProcessContext.Provider>
    )
}

export default InProcessAssignPage