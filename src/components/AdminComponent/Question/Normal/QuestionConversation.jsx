import React, { createRef, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { IMG_URL_BASE } from '~/GlobalConstant.js';
import DropDownList from '../../../CommonComponent/DropDownList';
import toast from '@/helper/Toast';
import { appClient } from '~/AppConfigs';

function QuestionConversation() {
    const [forms, setForms] = useState([]);
    const formRefs = useRef([]);
    const [imageFile, setImageFile] = useState(null);
    const [audioFile, setAudioFile] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [indexLevel, setIndexLevel] = useState(-1);

    const inputAudioRef = useRef(null);
    const audioRef = useRef(null);
    const level = ["Normal", "Intermediate", "Hard", "Very Hard"]


    const handleSelectedLevel = (item, index) => {
        setSelectedLevel(item);
        setIndexLevel(index);
    }

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

    const handleDeleteForm = (formIndex) => {
        const newForms = forms.filter((i, index) => index != formIndex);
        formRefs.current.splice(formIndex, 1);
        setForms(newForms)
    }

    const handleAddForm = () => {
        const newRef = createRef();
        formRefs.current.push(newRef);
        setForms((prev) => [...prev, newRef]);
    };

    const handleSubmitForm = async () => {
        let isValid = true;

        for (const ref of formRefs.current) {
            if (ref.current && !ref.current.isValid()) {
                isValid = false;
                break;
            }
        }

        if (isValid == false) return;

        const allData = formRefs.current.map((ref, index) => {
            if (ref.current) {
                return {
                    formIndex: index,
                    data: ref.current.getFormData()
                }
            }

            return null;
        })

        if (!imageFile) {
            toast({
                type: "error",
                title: "ERROR",
                message: `Image is required`,
                duration: 4000
            });
            return;
        }

        if (!selectedLevel) {
            toast({
                type: "error",
                title: "ERROR",
                message: `Level is required`,
                duration: 4000
            });
            return;
        }

        if (!audioFile) {
            toast({
                type: "error",
                title: "ERROR",
                message: `Audio is required`,
                duration: 4000
            });
            return;
        }

        try {
            const listSub = [...allData.map((item) => item.data)];
            if (listSub.length == 0) {
                toast({
                    type: "error",
                    title: "Error",
                    message: "You need more information sub questions",
                    duration: 4000
                });
                return;
            }
            const formData = new FormData();
            formData.append("Image", imageFile);
            formData.append("Audio", audioFile);
            formData.append("Level", selectedLevel.value);
            formData.append("Quantity", allData.length);
            formData.append("SubLcConsJson", JSON.stringify(listSub));

            const response = await appClient.post("api/lc-con", formData);
            const dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Success",
                    message: "Create questions successfully",
                    duration: 4000
                });

                setForms([]);
                formRefs.current = [];
                setAudioFile(null);
                setImageFile(null);
                setSelectedLevel(null);
                setIndexLevel(-1);
            }
        }
        catch {

        }
    }

    return (
        <div className='flex flex-col flex-1 overflow-visible p-[20px]'>
            <div className='flex justify-end h-[54px] items-center'>
                <div className='flex justify-center'>
                    <button className='qam__btn-func mr-[20px]' onClick={handleAddForm}>Add Sub</button>
                    <button className='qam__btn-func' onClick={handleSubmitForm}>Create Question</button>
                </div>
            </div>
            <div className='grid grid-cols-12 gap-[20px] overflow-visible mt-[10px]'>
                <div className='col-span-4 overflow-visible'>
                    <label
                        htmlFor='input-file-1'
                        id="drop-area"
                        className='bg-gray-50 rounded-[10px] h-[380px] flex-1 flex justify-center items-center flex-col cursor-pointer'
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

                    <div className=' mr-[40px] w-full items-center mt-[20px]'>
                        {
                            audioFile == null ?
                                <input className='qam__input cursor-pointer !w-full' readOnly placeholder='Upload file audio ...' onClick={(e) => inputAudioRef.current.click()} />
                                :
                                <div className='flex items-center flex-1'>
                                    <audio controls preload='auto' ref={audioRef} className='flex-1'>
                                        <source src={URL.createObjectURL(audioFile)} type="audio/mpeg" />
                                    </audio>

                                    <button className='p-[8px] ml-[10px] qam__btn-remove rounded-[10px] transition-all duration-700' onClick={(e) => setAudioFile(null)}>
                                        <img src={IMG_URL_BASE + "trash_icon.svg"} className='w-[30px] p-[5px]' />
                                    </button>
                                </div>
                        }
                        <input ref={inputAudioRef} type='file' accept='audio/*' className='hidden' onChange={handleChangeFileAudio} />
                    </div>
                    <div className='flex items-center mt-[20px] overflow-visible'>
                        <DropDownList
                            data={level.map((item, index) => ({ key: item, value: index + 1 }))}
                            className={"qam__answer--input"}
                            onSelectedItem={handleSelectedLevel}
                            defaultIndex={indexLevel}
                            placeholder={"Select Level"}
                        />
                    </div>
                </div>
                <div className='col-span-8 flex flex-col'>
                    <div className=" overflow-visible">
                        {forms.map((ref, index) => (
                            <SubQuestionForm key={index} index={index} ref={ref} onDeleteForm={handleDeleteForm} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

export const SubQuestionForm = forwardRef((props, ref) => {
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
        correct: "",
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

    const [selectedCorrect, setSelectedCorrect] = useState(null);
    const [indexCorrect, setIndexCorrect] = useState(-1);

    const correctAnswer = ["A", "B", "C", "D"]

    const handleSelectedCorrectAnswer = (item, index) => {
        setSelectedCorrect(item);
        setIndexCorrect(index);

        if (item) {
            setAnswerInfo((prev) => ({ ...prev, correctAnswer: item.value }));
        }
    }


    useImperativeHandle(ref, () => ({
        getFormData: () => ({
            ...questionInfo,
            answer: {
                ...answerInfo,
            }
        }),
        clearFormData: () => {
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
                correct: "",
            });

            setIndexCorrect(-1);
            setSelectedCorrect(null);
        },
        isValid: () => {
            for (let key in questionInfo) {
                if (!questionInfo[key]) {
                    inputQuestionRefs[key].current.focus();
                    inputQuestionRefs[key].current.classList.toggle("input-error");

                    toast({
                        type: "error",
                        title: "ERROR",
                        message: `${key.charAt(0).toUpperCase() + key.slice(1)} in question board is required`,
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
                        message: `${key.charAt(0).toUpperCase() + key.slice(1)} in answer board is required`,
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

            return true;
        }
    }));

    return (
        <div className="flex flex-col border rounded-[5px] p-4 mb-4  overflow-visible">
            <div className='flex justify-between items-center px-[10px]'>
                <div className='qam__question-num'>Question {props.index + 1}</div>
                <button className='qam__delete-form' onClick={(e) => props.onDeleteForm(props.index)}>Delete</button>
            </div>
            <div className="flex overflow-visible">
                <div className="flex-1 flex flex-col p-[10px] overflow-visible">
                    <div className="qam__question--title-form">Question Information</div>
                    {["question", "answerA", "answerB", "answerC", "answerD"].map((item) => {

                        const isAnswer = item.includes("answer");
                        let nameTitle = isAnswer ? `Answer ${item.at(-1)}` : `${item.charAt(0).toUpperCase() + item.slice(1)}`;
                        return (
                            <div className="flex items-center mt-[10px]" key={item}>
                                <div className="qam__answer--title">{nameTitle}</div>
                                <input
                                    className="qam__answer--input"
                                    value={questionInfo[item]}
                                    ref={inputQuestionRefs[item]}
                                    onChange={(e) =>
                                        setQuestionInfo((prev) => ({ ...prev, [item]: e.target.value }))
                                    }
                                />
                            </div>
                        )
                    })}

                </div>

                <div className="flex-1 flex flex-col p-[10px] overflow-visible">
                    <div className="qam__question--title-form">Answer Information</div>
                    {["question", "answerA", "answerB", "answerC", "answerD"].map((item) => {
                        const isAnswer = item.includes("answer");
                        let nameTitle = isAnswer ? `Answer ${item.at(-1)}` : `${item.charAt(0).toUpperCase() + item.slice(1)}`;

                        return (
                            <div className="flex items-center mt-[10px]" key={item}>
                                <div className="qam__answer--title">{nameTitle}</div>
                                <input
                                    className="qam__answer--input"
                                    value={answerInfo[item]}
                                    ref={inputAnswerRefs[item]}
                                    onChange={(e) =>
                                        setAnswerInfo((prev) => ({ ...prev, [item]: e.target.value }))
                                    }
                                />
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="flex items-start px-[10px] overflow-visible">
                <div className="qam__answer--title">Correct</div>
                <DropDownList
                    data={correctAnswer.map((item) => ({ key: item, value: item }))}
                    className={"qam__answer--input"}
                    onSelectedItem={handleSelectedCorrectAnswer}
                    defaultIndex={indexCorrect}
                />
            </div>
        </div>
    );
})

export default QuestionConversation