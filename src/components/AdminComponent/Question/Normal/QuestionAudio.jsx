import React, { useContext, useEffect, useRef, useState } from 'react'
import { IMG_URL_BASE } from '~/GlobalConstant.js';
import { useParams } from 'react-router-dom';
import DropDownList from '../../../CommonComponent/DropDownList';
import { appClient } from '~/AppConfigs';
import toast from '@/helper/Toast';
import LoaderPage from './../../../LoaderComponent/LoaderPage';


function QuestionAudio() {
    const [isLoading, setIsLoading] = useState(false);
    const [audioFile, setAudioFile] = useState(null);
    const [selectedCorrect, setSelectedCorrect] = useState(null);
    const [indexCorrect, setIndexCorrect] = useState(-1);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [indexLevel, setIndexLevel] = useState(-1);
    const inputAudioRef = useRef(null);
    const audioRef = useRef(null);

    const [questionInfo, setQuestionInfo] = useState({
        question: "",
        answerA: "",
        answerB: "",
        answerC: "",
    });

    const [answerInfo, setAnswerInfo] = useState({
        question: "",
        answerA: "",
        answerB: "",
        answerC: "",
        correctAnswer: ""
    });

    const inputQuestionRefs = {
        question: useRef(),
        answerA: useRef(null),
        answerB: useRef(null),
        answerC: useRef(null),
    };

    const inputAnswerRefs = {
        question: useRef(),
        answerA: useRef(null),
        answerB: useRef(null),
        answerC: useRef(null)
    };

    const handleQuestionChange = (e) => {
        const { name, value } = e.target;
        setQuestionInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleAnswerChange = (e) => {
        const { name, value } = e.target;
        setAnswerInfo((prev) => ({ ...prev, [name]: value }));
    };


    const handleChangeFileAudio = (event) => {
        event.preventDefault();
        let file = event.target.files[0];

        if (file) {
            setAudioFile(file);

        }
        else {
            setAudioFile(null);
        }

        event.target.value = "";
    }

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


    const handleClearInputs = () => {
        setQuestionInfo({
            question: "",
            answerA: "",
            answerB: "",
            answerC: "",
        });

        setAnswerInfo({
            question: "",
            answerA: "",
            answerB: "",
            answerC: "",
            correctAnswer: ""
        });


        setSelectedCorrect(null);
        setIndexCorrect(-1);

        setSelectedLevel(null);
        setIndexLevel(-1);

        setAudioFile(null);
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
            console.log(key);
            if (!answerInfo[key] && key !== "correctAnswer") {
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

        if (!audioFile) {
            toast({
                type: "error",
                title: "ERROR",
                message: `Audio is required`,
                duration: 4000
            });

            return false;
        }

        return true;
    };

    const handleSubmit = async () => {
        if (validateForm() == false) return;

        setIsLoading(true);
        try {
            const formData = new FormData();
            formData.append("Audio", audioFile);
            formData.append("Level", selectedLevel.value);

            Object.keys(questionInfo).map((key, index) => {
                formData.append(key, questionInfo[key]);
            })

            Object.keys(answerInfo).map((key, index) => {
                formData.append(`Answer.${key}`, answerInfo[key]);
            });

            const response = await appClient.post("api/lc-audios", formData);
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

            setIsLoading(false);
        }
        catch {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.load();
        }
    }, []);

    return (
        <>
            <div className='h-full flex flex-col mt-[20px] p-[20px]'>
                <div className='flex overflow-visible'>
                    <div className='flex-1 flex flex-col p-[10px] overflow-visible'>
                        <div className='qam__question--title'>Question Information</div>
                        {["question", "answerA", "answerB", "answerC"].map((item) => {
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
                    </div>
                    <div className='flex-1 flex flex-col p-[10px] overflow-visible'>
                        <div className='qam__question--title'>Answer Information</div>
                        {["question", "answerA", "answerB", "answerC"].map((item) => {
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
                    </div>
                </div>
                <div className='flex items-center mt-[10px] justify-between overflow-visible px-[10px] h-[54px]'>
                    <div className='flex items-center flex-1 mr-[20px]'>
                        <div className='qam__answer--title'>Audio</div>
                        <input ref={inputAudioRef} type='file' accept='audio/*' className='hidden' onChange={handleChangeFileAudio} />
                        {
                            audioFile == null ?
                                <input className='qam__input cursor-pointer !w-full' readOnly placeholder='Upload file audio ...' onClick={(e) => inputAudioRef.current.click()} />
                                :
                                <div className='flex items-center flex-1 overflow-hidden'>
                                    <audio controls preload='auto' ref={audioRef} className='flex-1 '>
                                        <source src={URL.createObjectURL(audioFile)} type="audio/mpeg" />
                                    </audio>

                                    <button className='p-[7px] ml-[10px] qam__btn-remove rounded-[10px] transition-all duration-700' onClick={(e) => setAudioFile(null)}>
                                        <img src={IMG_URL_BASE + "trash_icon.svg"} className='w-[25px] p-[5px]' />
                                    </button>
                                </div>
                        }
                    </div>

                    <div className='flex justify-end  flex-1'>
                        <button className='qam__btn-func' onClick={handleSubmit}>Create Question</button>
                    </div>
                </div>
            </div>

            {isLoading && <LoaderPage />}
        </>
    )
}

export default QuestionAudio