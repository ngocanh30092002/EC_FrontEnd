import React, { createRef, forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { IMG_URL_BASE } from '~/GlobalConstant.js';
import DropDownList from '../../../CommonComponent/DropDownList';
import toast from '@/helper/Toast';
import { appClient } from '~/AppConfigs';
import { SubQuestionForm } from './QuestionConversation';
import MaskedInput from 'react-text-mask';

function QuestionSingle() {
    const [forms, setForms] = useState([]);
    const formRefs = useRef([]);
    const [imageFile, setImageFile] = useState(null);
    const [selectedLevel, setSelectedLevel] = useState(null);
    const [indexLevel, setIndexLevel] = useState(-1);
    const [time, setTime] = useState("00:00:00");

    const level = ["Normal", "Intermediate", "Hard", "Very Hard"]

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
            return ;
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
            return ;

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
            formData.append("Time", time);
            formData.append("Level", selectedLevel.value);
            formData.append("Quantity", allData.length);
            formData.append("SubRcSingleDtoJson", JSON.stringify(listSub));

            const response = await appClient.post("api/rc-single", formData);
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
                setImageFile(null);
                setSelectedLevel(null);
                setIndexLevel(-1);
                setTime("00:00:00")
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

                    <div className='flex items-center overflow-visible mt-[20px]'>
                        <DropDownList
                            data={level.map((item, index) => ({ key: item, value: index + 1 }))}
                            className={"qam__answer--input"}
                            onSelectedItem={handleSelectedLevel}
                            defaultIndex={indexLevel}
                            placeholder={"Select Level"}
                        />
                    </div>

                    <div className='flex items-center overflow-visible mt-[20px]'>
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

export default QuestionSingle