import React, { createRef, useRef, useState } from 'react';
import { IMG_URL_BASE } from '~/GlobalConstant.js';
import DropDownList from '../../../CommonComponent/DropDownList';
import { SubQuestionForm } from './QuestionConversation';
import MaskedInput from 'react-text-mask';
import toast from '@/helper/Toast';
import { appClient } from '~/AppConfigs';

function QuestionRcConversation({ isDouble = true }) {
    const [forms, setForms] = useState([]);
    const formRefs = useRef([]);
    const [imageFile1, setImageFile1] = useState(null);
    const [imageFile2, setImageFile2] = useState(null);
    const [imageFile3, setImageFile3] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [indexLevel, setIndexLevel] = useState(-1);
    const [time, setTime] = useState("00:00:00");


    const inputTimeRef = useRef(null);
    const timeMask = [/\d/, /\d/, ':', /\d/, /\d/, ':', /\d/, /\d/];

    const level = ["Normal", "Intermediate", "Hard", "Very Hard"]

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


        if (!imageFile1) {
            toast({
                type: "error",
                title: "ERROR",
                message: `Image 1 is required`,
                duration: 4000
            });
            return;
        }

        if (!imageFile2) {
            toast({
                type: "error",
                title: "ERROR",
                message: `Image 2 is required`,
                duration: 4000
            });
            return;
        }

        if (isDouble == false) {
            if (!imageFile3) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: `Image 3 is required`,
                    duration: 4000
                });
                return;
            }
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
            return;
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
            formData.append("Image1", imageFile1);
            formData.append("Image2", imageFile2);
            
            if(isDouble == false){
                formData.append("Image3", imageFile3);
            }

            formData.append("Time", time);
            formData.append("Level", selectedLevel.value);
            formData.append("Quantity", allData.length);
            let apiPath = ""
            if(isDouble){
                formData.append("SubRcDoubleDtoJson", JSON.stringify(listSub));
                apiPath = "api/rc-double"
            }
            else{
                apiPath = "api/rc-triple"
                formData.append("SubRcTripleResDtoJson", JSON.stringify(listSub));
            }

            const response = await appClient.post(apiPath, formData);
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
                setImageFile1(null);
                setImageFile2(null);
                setImageFile3(null);
                setTime("00:00:00")
                setSelectedLevel(null);
                setIndexLevel(-1);
            }
        }
        catch (err){

        }

    }

    const handleDeleteForm = (formIndex) => {
        const newForms = forms.filter((i, index) => index != formIndex);
        formRefs.current.splice(formIndex, 1);
        setForms(newForms)
    }

    return (
        <div className='flex flex-col h-full overflow-visible p-[20px]'>
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

                {
                    isDouble == false &&
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
                }
            </div>

            <div className='flex items-center justify-between mt-[20px] overflow-visible'>
                <div className='flex items-center overflow-visible flex-1 ml-[20px]'>
                    <div className='qam__answer--title'>Level</div>
                    <DropDownList
                        data={level.map((item, index) => ({ key: item, value: index + 1 }))}
                        className={"qam__answer--input"}
                        onSelectedItem={handleSelectedLevel}
                        defaultIndex={indexLevel}
                    />
                </div>

                <div className='flex items-center overflow-visible ml-[40px] flex-1'>
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

            <div className="mt-[20px] overflow-visible">
                {forms.map((ref, index) => (
                    <SubQuestionForm key={index} index={index} ref={ref} onDeleteForm={handleDeleteForm} />
                ))}
            </div>
        </div>
    )
}

export default QuestionRcConversation