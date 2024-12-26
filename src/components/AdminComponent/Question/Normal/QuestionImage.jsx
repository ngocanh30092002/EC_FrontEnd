import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import toast from '@/helper/Toast';
import { IMG_URL_BASE } from '~/GlobalConstant.js';
import DropDownList from '../../../CommonComponent/DropDownList';
import { appClient } from '~/AppConfigs';

function QuestionImage() {
    const [imageFile, setImageFile] = useState(null);
    const [audioFile, setAudioFile] = useState(null);
    const [selectedCorrect, setSelectedCorrect] = useState(null);
    const [indexCorrect, setIndexCorrect] = useState(-1);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [indexLevel, setIndexLevel] = useState(-1);
    const inputAudioRef = useRef(null);
    const audioRef = useRef(null);

    const [answerInfo, setAnswerInfo] = useState({
        answerA: "",
        answerB: "",
        answerC: "",
        answerD: "",
        correctAnswer: "",
    });


    const inputAnswerRefs = {
        answerA: useRef(null),
        answerB: useRef(null),
        answerC: useRef(null),
        answerD: useRef(null),
    };

    const handleAnswerChange = (e) => {
        const { name, value } = e.target;
        setAnswerInfo((prev) => ({ ...prev, [name]: value }));
    };

    const correctAnswer = ["A", "B", "C", "D"]
    const level = ["Normal", "Intermediate", "Hard", "Very Hard"]

    const handleDragOver = (event) => {
        event.preventDefault();
    }

    const handleDropFile = (event) => {
        event.preventDefault();
        let file = event.dataTransfer.files[0];

        if (file) {
            setImageFile(file);
        }
        else {
            setImageFile(null);
        }
    }

    const handleUploadFile = (event) => {
        event.preventDefault();
        let file = event.target.files[0];

        if (file) {
            setImageFile(file);

        }
        else {
            setImageFile(null);
        }

        event.target.value = "";
    }

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

    const validateForm = () => {
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

        if (!imageFile) {
            toast({
                type: "error",
                title: "ERROR",
                message: `Image is required`,
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

    const handleClearInputs = () => {
        setAnswerInfo({
            answerA: "",
            answerB: "",
            answerC: "",
            answerD: "",
            correct: "",
        });

        setSelectedCorrect(null);
        setIndexCorrect(-1);

        setSelectedLevel(null);
        setIndexLevel(-1);

        setAudioFile(null);
        setImageFile(null);
    };

    const handleSubmit = async () => {
        if (validateForm() == false) return;

        try {
            const formData = new FormData();
            formData.append("Image", imageFile);
            formData.append("Audio", audioFile);
            formData.append("Level", selectedLevel.value);
            formData.append("Answer", answerInfo);

            Object.keys(answerInfo).map((key, index) =>{
                formData.append(`Answer.${key}` , answerInfo[key]);
            })

            const response = await appClient.post("api/lc-images", formData);
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
        catch (err){
            console.log(err);
        }
    };

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.load();
        }
    }, []);

    return (
        <div className='flex flex-col flex-1 overflow-visible p-[20px]'>
            <div className="grid grid-cols-12 flex-1 gap-[20px] mt-[20px] overflow-visible">
                <div className='col-span-4 flex flex-col overflow-visible'>
                    <label
                        htmlFor='input-file-1'
                        id="drop-area"
                        className='bg-gray-50 rounded-[10px] max-h-[430px] flex-1 flex justify-center items-center flex-col cursor-pointer'
                        onDragOver={handleDragOver}
                        onDrop={handleDropFile}>
                        <input type='file' className='hidden' id="input-file-1" onChange={(e) => handleUploadFile(e, 1)} />
                        {
                            imageFile == null ?
                                <>
                                    <img src={IMG_URL_BASE + "upload-cloud-icon.png"} className='w-[60px]' />
                                    <div className='hpsf__drag-title font-bold'>Drag, drop, click to upload image </div>
                                </>
                                :
                                <img src={URL.createObjectURL(imageFile)} className='w-full object-cover h-full border' onClick={(e) => setImageFile(null)} />

                        }
                    </label>
                    <input ref={inputAudioRef} type='file' accept='audio/*' className='hidden' onChange={handleChangeFileAudio} />
                </div>
                <div className='col-span-8 flex flex-col overflow-visible'>
                    <div className='flex overflow-visible'>
                        <div className='flex-1 flex flex-col  p-[10px] overflow-visible'>
                            <div className='qam__question--title'>Answer Information</div>
                            {["answerA", "answerB", "answerC", "answerD"].map((item) => (
                                <div className="flex items-center mt-[20px]" key={item}>
                                    <div className="qam__answer--title">{`Answer ${item.at(-1)}`}</div>
                                    <input
                                        className="qam__answer--input"
                                        name={item}
                                        value={answerInfo[item]}
                                        ref={inputAnswerRefs[item]}
                                        onChange={handleAnswerChange}
                                    />
                                </div>
                            ))}

                            <div className='flex items-center mt-[20px] overflow-visible'>
                                <div className='qam__answer--title'>Correct</div>
                                <DropDownList
                                    data={correctAnswer.map((item) => ({ key: item, value: item }))}
                                    className={"qam__answer--input"}
                                    onSelectedItem={handleSelectedCorrectAnswer}
                                    defaultIndex={indexCorrect}
                                />
                            </div>

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
                    </div>
                </div>
            </div>

            <div className='grid grid-cols-12 mt-[20px]'>
                <div className='col-span-4'>
                    {
                        audioFile == null ?
                            <input className='qam__input mt-[20px] cursor-pointer !w-full' readOnly placeholder='Upload file audio ...' onClick={(e) => inputAudioRef.current.click()} />
                            :
                            <div className='flex items-center mt-[10px]'>
                                <audio controls preload='auto' ref={audioRef} className='flex-1'>
                                    <source src={URL.createObjectURL(audioFile)} type="audio/mpeg" />
                                </audio>

                                <button className='p-[8px] ml-[10px] qam__btn-remove rounded-[10px] transition-all duration-700' onClick={(e) => setAudioFile(null)}>
                                    <img src={IMG_URL_BASE + "trash_icon.svg"} className='w-[30px] p-[5px]' />
                                </button>
                            </div>
                    }
                </div>

                <div className='col-span-8'>
                    <div className='flex justify-end mt-[20px]'>
                        <button className='qam__btn-func' onClick={handleSubmit}>Create Question</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default QuestionImage