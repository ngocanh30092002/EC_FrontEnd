import React, { createRef, forwardRef, useContext, useImperativeHandle, useRef, useState } from 'react'
import { IMG_URL_BASE } from '~/GlobalConstant.js';
import DropDownList from '../../../CommonComponent/DropDownList';
import toast from '@/helper/Toast';
import { useParams } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import { ToeicAddQuestionContext } from './ToeicAddQuestion';

function QuestionConversation({ currentQues, part }) {
    const [forms, setForms] = useState([]);
    const formRefs = useRef([]);

    const { toeicId } = useParams();
    const [imageFile1, setImageFile1] = useState(null);
    const [imageFile2, setImageFile2] = useState(null);
    const [imageFile3, setImageFile3] = useState(null);
    const [audioFile, setAudioFile] = useState(null);
    const inputAudioRef = useRef(null);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [indexLevel, setIndexLevel] = useState(-1);

    const dataContext = useContext(ToeicAddQuestionContext);

    const audioRef = useRef(null);

    const level = ["Normal", "Intermediate", "Hard", "Very Hard"]

    const handleSelectedLevel = (item, index) => {
        setSelectedLevel(item);
        setIndexLevel(index);
    }

    const handleDragOver = (event) => {
        event.preventDefault();
    }

    const handleDropFile = (event, type) => {
        event.preventDefault();
        let file = event.dataTransfer.files[0];

        if (file) {
            if (type == 1) {
                setImageFile1(file);
            }
            if (type == 2) {
                setImageFile2(file);
            }
            if (type == 3) {
                setImageFile3(file);
            }
        }
        else {
            if (type == 1) {
                setImageFile1(null);
            }
            if (type == 2) {
                setImageFile2(null);
            }
            if (type == 3) {
                setImageFile3(null);
            }
        }
    }

    const handleUploadFile = (event, type) => {
        event.preventDefault();
        let file = event.target.files[0];

        if (file) {
            if (type == 1) {
                setImageFile1(file);
            }
            if (type == 2) {
                setImageFile2(file);
            }
            if (type == 3) {
                setImageFile3(file);
            }
        }
        else {
            if (type == 1) {
                setImageFile1(null);
            }
            if (type == 2) {
                setImageFile2(null);
            }
            if (type == 3) {
                setImageFile3(null);
            }
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

    const handleAddForm = () => {
        const newRef = createRef();
        formRefs.current.push(newRef);
        setForms((prev) => [...prev, newRef]);
    };

    const handleSubmitQuestions = async () => {
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

        if (!selectedLevel) {
            toast({
                type: "error",
                title: "ERROR",
                message: `Level is required`,
                duration: 4000
            });
            return false;
        }

        try {
            const listSubData = [...allData.map((item) => item.data)];

            const formData = new FormData();
            formData.append("ToeicId", toeicId);
            formData.append("Part", part);
            formData.append("Level", selectedLevel.value);
            formData.append("SubToeicDtoJson", JSON.stringify(listSubData));

            if(audioFile){
                formData.append("Audio", audioFile);
            }
            if (imageFile1) {
                formData.append("Image_1", imageFile1);
            }
            if (imageFile2) {
                formData.append("Image_2", imageFile2);
            }
            if (imageFile3) {
                formData.append("Image_3", imageFile3);
            }

            const response = await appClient.post("api/quesToeic", formData);
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
                dataContext.reload();
                setAudioFile(null);
                setImageFile1(null);
                setImageFile2(null);
                setImageFile3(null);
                setSelectedLevel(null);
                setIndexLevel(-1);
            }
        }
        catch (err) {
            console.log(err);
        }

    }

    const handleDeleteForm = (formIndex) => {
        const newForms = forms.filter((i, index) => index != formIndex);
        formRefs.current.splice(formIndex, 1);
        setForms(newForms)
    }

    return (
        <div className='flex flex-col h-full  overflow-visible'>
            {currentQues != -1 &&
                <>
                    <div className='flex items-center justify-end mt-[20px]'>
                        <button className='qam__btn-func mr-[10px]' onClick={handleAddForm}> Add Sub </button>

                        <button className='qam__btn-func' onClick={handleSubmitQuestions}> Create Questions</button>
                    </div>
                    <div className='flex mt-[20px] min-h-[300px]'>
                        <div className='flex-1 mr-[20px]'>
                            <label
                                htmlFor='input-file-1'
                                id="drop-area-1"
                                className='bg-gray-50 rounded-[10px] h-full max-h-[300px] flex justify-center items-center flex-col cursor-pointer'
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDropFile(e, 1)}>
                                <input type='file' className='hidden' id="input-file-1" onChange={(e) => handleUploadFile(e, 1)} />
                                {
                                    imageFile1 == null ?
                                        <>
                                            <img src={IMG_URL_BASE + "upload-cloud-icon.png"} className='w-[60px]' />
                                            <div className='hpsf__drag-title font-bold'>Drag, drop, click to upload image 1 </div>
                                        </>
                                        :
                                        <img src={URL.createObjectURL(imageFile1)} className='w-full object-cover h-full border' onClick={(e) => setImageFile1(null)} />

                                }
                            </label>
                        </div>

                        <div className='flex-1 mr-[20px]'>
                            <label
                                htmlFor='input-file-2'
                                id="drop-area-2"
                                className='bg-gray-50 rounded-[10px] h-full max-h-[300px] flex justify-center items-center flex-col cursor-pointer'
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDropFile(e, 2)}>
                                <input type='file' className='hidden' id="input-file-2" onChange={(e) => handleUploadFile(e, 2)} />
                                {
                                    imageFile2 == null ?
                                        <>
                                            <img src={IMG_URL_BASE + "upload-cloud-icon.png"} className='w-[60px]' />
                                            <div className='hpsf__drag-title font-bold'>Drag, drop, click to upload image 2 </div>
                                        </>
                                        :
                                        <img src={URL.createObjectURL(imageFile2)} className='w-full object-cover h-full border' onClick={(e) => setImageFile2(null)} />

                                }
                            </label>
                        </div>

                        <div className='flex-1'>
                            <label
                                htmlFor='input-file-3'
                                id="drop-area-3"
                                className='bg-gray-50 rounded-[10px] h-full max-h-[300px] flex justify-center items-center flex-col cursor-pointer'
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDropFile(e, 3)}>
                                <input type='file' className='hidden' id="input-file-3" onChange={(e) => handleUploadFile(e, 3)} />
                                {
                                    imageFile3 == null ?
                                        <>
                                            <img src={IMG_URL_BASE + "upload-cloud-icon.png"} className='w-[60px]' />
                                            <div className='hpsf__drag-title font-bold'>Drag, drop, click to upload image 3 </div>
                                        </>
                                        :
                                        <img src={URL.createObjectURL(imageFile3)} className='w-full object-cover h-full border' onClick={(e) => setImageFile3(null)} />

                                }
                            </label>
                        </div>
                    </div>

                    <div className='flex justify-between mt-[20px] min-h-[54px] overflow-visible'>
                        {
                            part == 3 || part == 4 ?
                                <div className='flex items-center flex-1'>
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
                                :
                                null
                        }

                        <div className='flex items-center overflow-visible flex-1 ml-[20px]'>
                            <div className='qam__answer--title'>Level</div>
                            <DropDownList
                                data={level.map((item, index) => ({ key: item, value: index + 1 }))}
                                className={"qam__answer--input"}
                                onSelectedItem={handleSelectedLevel}
                                defaultIndex={indexLevel}
                            />
                        </div>
                    </div>

                    <div className="mt-[20px] overflow-visible">
                        {forms.map((ref, index) => (
                            <SubQuestionForm key={index} index={index} ref={ref} part={part} currentQues={currentQues + index} onDeleteForm={handleDeleteForm} />
                        ))}
                    </div>
                </>
            }

            {currentQues == -1 &&
                <div className='qam__full-ques'>
                    Part {part} has maximum questions
                </div>
            }
        </div>
    )
}

const SubQuestionForm = forwardRef((props, ref) => {
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
    const inputExplanationRef = useRef(null);

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
                explaination: inputExplanationRef.current.value
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

            inputExplanationRef.current.value = "";
            setIndexCorrect(-1);
            setSelectedCorrect(null);
        },
        isValid: () => {
            for (let key in questionInfo) {
                if (!questionInfo[key]) {
                    let isQuestion = key.includes("question");
                    if (props.part == 6 && isQuestion) {
                        continue;
                    }
                    else {
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
            }

            for (let key in answerInfo) {
                if (!answerInfo[key] && key !== "correct") {
                    let isQuestion = key.includes("question");
                    if (props.part == 6 && isQuestion) {
                        continue;
                    }
                    else {
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
                <div className='qam__question-num'>Question {props.currentQues}</div>
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

            <div className='flex items-start px-[10px] mt-[10px] overflow-visible'>
                <div className='qam__answer--title'>Explanation</div>
                <textarea rows={3} ref={inputExplanationRef} className='border border-[#cccccc] flex-1 resize-none rounded-[20px] qam__answer--input' />
            </div>
        </div>
    );
});

export default QuestionConversation