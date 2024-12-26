import React, { useContext, useEffect, useRef, useState } from 'react'
import { IMG_URL_BASE } from '~/GlobalConstant.js';
import { useParams } from 'react-router-dom';
import DropDownList from '../../../CommonComponent/DropDownList';
import { appClient } from '~/AppConfigs';
import toast from '@/helper/Toast';
import MaskedInput from 'react-text-mask';

function QuestionSentence() {
    const [time, setTime] = useState("00:00:00");
    const [selectedCorrect, setSelectedCorrect] = useState(null);
    const [indexCorrect, setIndexCorrect] = useState(-1);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [indexLevel, setIndexLevel] = useState(-1);
    const inputExplanationRef = useRef(null);
    const inputTimeRef = useRef(null);
    const timeMask = [/\d/, /\d/, ':', /\d/, /\d/, ':', /\d/, /\d/];

    const isValidTime = (time) => {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return (
            hours >= 0 && hours <= 23 &&
            minutes >= 0 && minutes <= 59 &&
            seconds >= 0 && seconds <= 59
        );
    };

    const timeToSeconds = (time) => {
        let [hours, minutes, seconds] = time.split(':').map(Number);
        return Math.round(hours * 3600 + minutes * 60 + seconds);
    }

    const secondsToTime = (totalSeconds) => {
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    const [questionInfo, setQuestionInfo] = useState({
        question: "",
        answerA: "",
        answerB: "",
        answerC: "",
        answerD: "",
    });

    const [answerInfo, setAnswerInfo] = useState({
        question: "",
        answerA: "",
        answerB: "",
        answerC: "",
        answerD: "",
        correctAnswer: ""
    });

    const inputQuestionRefs = {
        question: useRef(),
        answerA: useRef(null),
        answerB: useRef(null),
        answerC: useRef(null),
        answerD: useRef(null),
    };

    const inputAnswerRefs = {
        question: useRef(),
        answerA: useRef(null),
        answerB: useRef(null),
        answerC: useRef(null),
        answerD: useRef(null)
    };

    const handleQuestionChange = (e) => {
        const { name, value } = e.target;
        setQuestionInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleAnswerChange = (e) => {
        const { name, value } = e.target;
        setAnswerInfo((prev) => ({ ...prev, [name]: value }));
    };

    const correctAnswer = ["A", "B", "C", "D"]
    const level = ["Normal", "Intermediate", "Hard", "Very Hard"]

    const handleSelectedCorrectAnswer = (item, index) => {
        setSelectedCorrect(item);
        setIndexCorrect(index);

        if (item) {
            setAnswerInfo((prev) => ({ ...prev, correctAnswer: item.value }));
        }
    }

    const handleSelectedLevel = (item, index) => {
        setSelectedLevel(item);
        setIndexLevel(index);
    }

    const handleAddSpace = (ref) => {
        if (ref.current) {
            const { name, value } = ref.current;
            setQuestionInfo((prev) => ({ ...prev, [name]: value + "-------" }));
        }
    }

    const handleClearInputs = () => {
        setQuestionInfo({
            question: "",
            answerA: "",
            answerB: "",
            answerC: "",
            answerD: "",
        });

        setAnswerInfo({
            question: "",
            answerA: "",
            answerB: "",
            answerC: "",
            answerD: "",
            correctAnswer: ""
        });

        inputExplanationRef.current.value = "";

        setSelectedCorrect(null);
        setIndexCorrect(-1);

        setSelectedLevel(null);
        setIndexLevel(-1);

        setTime("00:00:00");
    };

    const validateForm = () => {
        for (let key in questionInfo) {
            if (!questionInfo[key]) {
                inputQuestionRefs[key].current.focus();
                inputQuestionRefs[key].current.classList.toggle("input-error");

                toast({
                    type: "error",
                    title: "ERROR",
                    message: `${key.charAt(0).toUpperCase() + key.slice(1)} is required`,
                    duration: 4000
                });


                setTimeout(() => {
                    inputQuestionRefs[key].current.classList.toggle("input-error");
                }, 2000);
                return false;
            }
        }

        for (let key in answerInfo) {
            if (!answerInfo[key] && key !== "correct") {
                inputAnswerRefs[key].current.focus();
                inputAnswerRefs[key].current.classList.toggle("input-error");

                toast({
                    type: "error",
                    title: "ERROR",
                    message: `${key.charAt(0).toUpperCase() + key.slice(1)} is required`,
                    duration: 4000
                });


                setTimeout(() => {
                    inputAnswerRefs[key].current.classList.toggle("input-error");
                }, 2000);
                return false;
            }
        }

        if (!answerInfo.correctAnswer) {
            toast({
                type: "error",
                title: "ERROR",
                message: `Correct answer is required`,
                duration: 4000
            });
            return false;
        }

        if (!selectedLevel) {
            toast({
                type: "error",
                title: "ERROR",
                message: `Level is required`,
                duration: 4000
            });
            return false;
        }

        let secondTime = timeToSeconds(time);

        if (!isValidTime(time)) {
            toast({
                type: "error",
                title: "ERROR",
                message: `Time is invalid`,
                duration: 4000
            });

            inputTimeRef.current.inputElement.classList.toggle("input-error");

            setTimeout(() => {
                inputTimeRef.current.inputElement.classList.toggle("input-error");
            }, 2000);
            return false;
        }

        if (secondTime == 0 || Number.isNaN(secondTime)) {
            toast({
                type: "error",
                title: "ERROR",
                message: `Time is required`,
                duration: 4000
            });

            inputTimeRef.current.inputElement.classList.toggle("input-error");

            setTimeout(() => {
                inputTimeRef.current.inputElement.classList.toggle("input-error");
            }, 2000);
            return false;
        }


        return true;
    };

    const handleSubmit = async () => {
        if (!validateForm()) return;

        try {
            const formData = new FormData();

            Object.keys(questionInfo).map((key, index) => {
                formData.append(key, questionInfo[key]);
            })

            formData.append("Time", time);
            formData.append("Level", selectedLevel.value);

            Object.keys(answerInfo).map((key, index) => {
                formData.append(`Answer.${key}`, answerInfo[key]);
            })

            formData.append(`Answer.Explanation`, inputExplanationRef.current.value);

            const response = await appClient.post("api/rc-sentence", formData);
            const dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Success",
                    message: "Create questions successfully",
                    duration: 4000
                });

                handleClearInputs();
            }
        }
        catch {

        }
    }


    return (
        <div className='h-full flex flex-col p-[20px]'>
            <div className='flex overflow-visible'>
                <div className='flex-1 flex flex-col p-[10px] overflow-visible'>
                    <div className='qam__question--title'>Question Information</div>
                    {["question", "answerA", "answerB", "answerC", "answerD"].map((item) => {
                        const isAnswer = item.includes("answer");
                        let nameTitle = isAnswer ? `Answer ${item.at(-1)}` : `${item.charAt(0).toUpperCase() + item.slice(1)}`;

                        return (
                            <div className="flex items-center mt-[20px]" key={item}>
                                <div className="qam__answer--title">{nameTitle}</div>
                                <input
                                    className="qam__answer--input"
                                    name={item}
                                    value={questionInfo[item]}
                                    ref={inputQuestionRefs[item]}
                                    onChange={handleQuestionChange}
                                />

                                {nameTitle == "Question" &&
                                    <button className='qam__answer-btn' onClick={(e) => handleAddSpace(inputQuestionRefs[item])}>
                                        Space
                                    </button>
                                }
                            </div>
                        )
                    })}
                    <div className='flex items-center mt-[20px] overflow-visible'>
                        <div className='qam__answer--title'>Level</div>
                        <DropDownList
                            data={level.map((item, index) => ({ key: item, value: index + 1 }))}
                            className={"qam__answer--input"}
                            onSelectedItem={handleSelectedLevel}
                            defaultIndex={indexLevel}
                        />
                    </div>

                    <div className='flex items-center overflow-visible mt-[20px]'>
                        <div className='qam__answer--title'>Time</div>
                        <MaskedInput
                            mask={timeMask}
                            placeholder="00:00:00"
                            className="qam__answer--input"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            ref={inputTimeRef}
                        />
                    </div>
                </div>
                <div className='flex-1 flex flex-col p-[10px] overflow-visible'>
                    <div className='qam__question--title'>Answer Information</div>
                    {["question", "answerA", "answerB", "answerC", "answerD"].map((item) => {
                        const isAnswer = item.includes("answer");
                        let nameTitle = isAnswer ? `Answer ${item.at(-1)}` : `${item.charAt(0).toUpperCase() + item.slice(1)}`;

                        return (
                            <div className="flex items-center mt-[20px]" key={item}>
                                <div className="qam__answer--title">{nameTitle}</div>
                                <input
                                    className="qam__answer--input"
                                    name={item}
                                    value={answerInfo[item]}
                                    ref={inputAnswerRefs[item]}
                                    onChange={handleAnswerChange}
                                />
                            </div>
                        )
                    })}

                    <div className='flex items-center mt-[20px] overflow-visible'>
                        <div className='qam__answer--title'>Correct</div>
                        <DropDownList
                            data={correctAnswer.map((item) => ({ key: item, value: item }))}
                            className={"qam__answer--input"}
                            onSelectedItem={handleSelectedCorrectAnswer}
                            defaultIndex={indexCorrect}
                        />
                    </div>

                    <div className='flex items-center overflow-visible mt-[20px]'>
                        <div className='qam__answer--title'>Explanation</div>
                        <input ref={inputExplanationRef} className='qam__answer--input' />
                    </div>
                </div>
            </div>

            <div className='flex justify-end mt-[20px]'>
                <button className='qam__btn-func' onClick={handleSubmit}>Create Question</button>
            </div>

        </div>
    )
}

export default QuestionSentence