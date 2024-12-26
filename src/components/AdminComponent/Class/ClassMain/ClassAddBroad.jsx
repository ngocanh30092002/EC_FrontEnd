import React, { useEffect, useRef, useState } from 'react'
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import DropDownList from './../../../CommonComponent/DropDownList';
import { appClient } from '~/AppConfigs';
import MaskedInput from 'react-text-mask';
import toast from '@/helper/Toast';

function ClassAddBroad({ isShow, onShow, onReloadClass }) {
    const [courses, setCourses] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [defaultIndex, setDefaultIndex] = useState(-1);
    const [selectedTeacher, setSelectedTeacher] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isCorrectCourse, setIsCorrectCourse] = useState(true);
    const [isCorrectTeacher, setIsCorrectTeacher] = useState(true);
    const [isShowList, setIsShowList] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const dateMask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/];

    const inputNameRef = useRef(null);
    const inputMaxNumRef = useRef(null);
    const inputStartRef = useRef(null);
    const inputEndRef = useRef(null);
    const inputDesRef = useRef(null);


    const handleGetCourses = async () => {
        try {
            const response = await appClient.get("api/Courses");
            const dataRes = response.data;
            if (dataRes.success) {
                setCourses(dataRes.message);
            }
        }
        catch {

        }
    }

    const getCurrentDate = () => {
        const today = new Date();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const year = today.getFullYear();

        return `${month}/${day}/${year}`;
    };

    const handleReset = () => {
        setImageFile(null);
        setDefaultIndex(-1);
        setSelectedTeacher(null);
        inputNameRef.current.value = "";
        inputMaxNumRef.current.value = "";
        inputDesRef.current.value = "";

        let currentDate = getCurrentDate();
        inputStartRef.current.inputElement.value = currentDate;
        inputEndRef.current.inputElement.value = currentDate;
    }

    const handleClearInput =(event) =>{
        event.preventDefault();
        handleReset();
    }

    const handleGetTeachers = async () => {
        try {
            const response = await appClient.get("api/teachers")
            const dataRes = response.data;
            if (dataRes.success) {
                setTeachers(dataRes.message);
            }
        }
        catch {

        }
    }

    const handleUploadFile = (event) => {
        let file = event.target.files[0];

        if (file) {
            setImageFile(file);
        }
        else {
            setImageFile(null);
        }
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

    const handleSelectedTeacher = (item) => {
        setSelectedTeacher(item);
        setIsShowList(false);
    }

    const handleNameChange = (event) => {
        if (inputNameRef.current) {
            inputNameRef.current.value = event.target.value.toUpperCase();
        }
    }

    const handleChangeMaxNumber = (event) => {
        if (inputMaxNumRef.current) {
            inputMaxNumRef.current.value = event.target.value.replace(/[^0-9]/g, '');
        }
    }

    const handleSelectedCourse = (item, index) => {
        if (item) {
            setSelectedCourse(item.value);
        }
        else {
            setSelectedCourse(null);
        }

        setDefaultIndex(index);
    }

    const handleSubmitClass = async (event) => {
        event.preventDefault();

        if (inputNameRef.current && (inputNameRef.current.value == "" || inputNameRef.current.value == null)) {
            toast({
                type: "error",
                title: "ERROR",
                message: "Class Name is required",
                duration: 4000
            });

            inputNameRef.current.focus();
            inputNameRef.current.classList.toggle("cabf__input--error");

            setTimeout(() => {
                inputNameRef.current.classList.toggle("cabf__input--error");
            }, 2000);
            return;
        }

        if (selectedCourse == null) {
            toast({
                type: "error",
                title: "ERROR",
                message: "Course is required",
                duration: 4000
            });

            setIsCorrectCourse(false);
            setTimeout(() => {
                setIsCorrectCourse(true);
            }, 2000);
        }

        if (selectedTeacher == null) {
            toast({
                type: "error",
                title: "ERROR",
                message: "Teacher is required",
                duration: 4000
            });

            setIsCorrectTeacher(false);
            setTimeout(() => {
                setIsCorrectTeacher(true);
            }, 2000);
        }

        if (inputMaxNumRef.current && (inputMaxNumRef.current.value == "" || inputMaxNumRef.current.value == null)) {
            toast({
                type: "error",
                title: "ERROR",
                message: "Members is required",
                duration: 4000
            });

            inputMaxNumRef.current.focus();
            inputMaxNumRef.current.classList.toggle("cabf__input--error");

            setTimeout(() => {
                inputMaxNumRef.current.classList.toggle("cabf__input--error");
            }, 2000);
            return;
        }

        let inputStart = inputStartRef.current.inputElement;
        if (inputStart && inputStart.value) {

            const [month, day, year] = inputStart.value.split("/");
            const date = new Date(year, month - 1, day);
            const isValid = date.getFullYear() === parseInt(year) && date.getMonth() === month - 1 && date.getDate() === parseInt(day)

            if (!isValid) {
                toast({
                    type: "error",
                    title: "Error",
                    message: "Date of birth is invalid",
                    duration: 4000
                });

                inputStart.classList.toggle("cabf__input--error");
                setTimeout(() => {
                    inputStart.classList.toggle("cabf__input--error");
                }, 2000);

                return;
            }
        }
        else {
            toast({
                type: "error",
                title: "Error",
                message: "Start Date is required",
                duration: 4000
            });

            inputStart.classList.toggle("cabf__input--error");
            setTimeout(() => {
                inputStart.classList.toggle("cabf__input--error");
            }, 2000);

            return;
        }

        let inputEnd = inputEndRef.current.inputElement;
        if (inputEnd && inputEnd.value) {

            const [month, day, year] = inputEnd.value.split("/");
            const date = new Date(year, month - 1, day);
            const isValid = date.getFullYear() === parseInt(year) && date.getMonth() === month - 1 && date.getDate() === parseInt(day)

            if (!isValid) {
                toast({
                    type: "error",
                    title: "Error",
                    message: "Date of birth is invalid",
                    duration: 4000
                });

                inputEnd.classList.toggle("cabf__input--error");
                setTimeout(() => {
                    inputEnd.classList.toggle("cabf__input--error");
                }, 2000);

                return;
            }
        }
        else {
            toast({
                type: "error",
                title: "Error",
                message: "Start Date is required",
                duration: 4000
            });

            inputEnd.classList.toggle("cabf__input--error");
            setTimeout(() => {
                inputEnd.classList.toggle("cabf__input--error");
            }, 2000);

            return;
        }

        if (inputDesRef.current && (inputDesRef.current.value == "" || inputDesRef.current.value == null)) {
            toast({
                type: "error",
                title: "ERROR",
                message: "Description is required",
                duration: 4000
            });

            inputDesRef.current.focus();
            inputDesRef.current.classList.toggle("cabf__input--error");

            setTimeout(() => {
                inputDesRef.current.classList.toggle("cabf__input--error");
            }, 2000);
            return;
        }

        try {
            const formData = new FormData(event.target);

            if (imageFile == null) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "File image is required",
                    duration: 4000
                });
                return;
            }

            formData.append("Image", imageFile);
            formData.append("TeacherId", selectedTeacher.teacherId)

            const response = await appClient.post("api/classes", formData);
            const dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Successfully",
                    message: "Create class successfully",
                    duration: 4000
                });

                handleReset();
                onShow(false);
                onReloadClass();
                return;
            }
        }
        catch {
        }
    }

    useEffect(() => {
        handleGetCourses();
        handleGetTeachers();

        let currentDate = getCurrentDate();
        inputStartRef.current.inputElement.value = currentDate;
        inputEndRef.current.inputElement.value = currentDate;
    }, [])

    return (
        <div className={`w-full h-[400px] mt-[20px] cab__wrapper p-[20px] border rounded-[10px] overflow-visible ${isShow ? "block" : "hidden"} p-[10px]`}>
            <div className='flex h-full overflow-visible'>
                <label
                    htmlFor='input-file'
                    id="drop-area"
                    className='bg-gray-50 rounded-[10px] w-[300px] h-full flex justify-center items-center flex-col cursor-pointer'
                    onDragOver={handleDragOver}
                    onDrop={handleDropFile}>
                    <input type='file' accept='image/*' className='hidden' id="input-file" onChange={(e) => handleUploadFile(e)}/>
                    {
                        imageFile == null ?
                            <>
                                <img src={IMG_URL_BASE + "upload-cloud-icon.png"} className='w-[60px]' />
                                <div className='hpsf__drag-title font-bold'>Drag and drop or click to upload files </div>
                            </>
                            :
                            <img src={URL.createObjectURL(imageFile)} className='w-full h-full object-cover' />

                    }
                </label>

                <form className='flex-1 cab__wrapper--form overflow-visible flex flex-col' onSubmit={handleSubmitClass}>
                    <div className='flex items-center mb-[15px] overflow-visible'>
                        <div className='flex items-center flex-1'>
                            <div className='cabf__title-name'>Name</div>
                            <input className='cabf__input' ref={inputNameRef} minLength={0} maxLength={10} name='ClassId' onChange={handleNameChange} />
                        </div>

                        <div className='flex items-center flex-1 overflow-visible'>
                            <div className='cabf__title-name'>Course</div>
                            <DropDownList
                                data={courses.map((item) => ({ key: item.courseId, value: item.courseId }))}
                                defaultIndex={defaultIndex}
                                placeholder={"Select course..."}
                                name={"CourseId"}
                                className={`border !rounded-[20px] w-full ${isCorrectCourse == false && "cabf__input--error"}`}
                                onSelectedItem={handleSelectedCourse} />
                        </div>
                    </div>

                    <div className='flex items-center mb-[15px] overflow-visible'>
                        <div className='flex-1 flex items-start overflow-visible'>
                            <div className='cabf__title-name mt-[10px]'>Teacher</div>
                            <div className='flex-1 relative overflow-visible'>
                                <div className={`cabf__teacher-default border ${isCorrectTeacher == false && "cabf__input--error"}`} onClick={(e) => setIsShowList(!isShowList)}>
                                    {selectedTeacher == null ?
                                        "Selected Teacher"
                                        :
                                        selectedTeacher.fullName
                                    }
                                </div>

                                {isShowList &&
                                    <div className='cabf__teacher-list border !absolute top-[calc(100%+5px)] left-0 w-full  cursor-pointer bg-white'>
                                        {teachers.map((item, index) => {
                                            return (
                                                <div className='cabf__teacher-item flex items-center' key={index} onClick={(e) => handleSelectedTeacher(item)}>
                                                    <img src={APP_URL + item.imageUrl} className='cabf__ti--img' />
                                                    <div className='flex flex-col justify-between items-start'>
                                                        <div className='cabf__ti--text line-clamp-1'>{item.fullName}</div>
                                                        <div className='cabf__ti--text line-clamp-1'>{item.email}</div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                }
                            </div>
                        </div>

                        <div className='flex items-center flex-1'>
                            <div className="cabf__title-name">Members</div>
                            <input className='cabf__input' name='MaxNum' ref={inputMaxNumRef} onChange={handleChangeMaxNumber} />
                        </div>
                    </div>

                    <div className='flex items-center mb-[15px]'>
                        <div className='flex items-center flex-1'>
                            <div className='cabf__title-name '>Start Date</div>
                            <MaskedInput
                                name='StartDate'
                                mask={dateMask}
                                ref={inputStartRef}
                                placeholder="MM/dd/yyyy"
                                className="cabf__input"
                            />
                        </div>

                        <div className='flex items-center flex-1'>
                            <div className='cabf__title-name'>End Date</div>
                            <MaskedInput
                                name='EndDate'
                                mask={dateMask}
                                ref={inputEndRef}
                                placeholder="MM/dd/yyyy"
                                className="cabf__input"
                            />
                        </div>
                    </div>

                    <div className='flex items-center flex-1 mb-[15px]'>
                        <div className="cabf__title-name">Description</div>
                        <textarea className='w-full cabf__input-area h-full' name='Description' ref={inputDesRef} />
                    </div>

                    <div className='flex justify-end '>
                        <button className='cabf__btn--func' type='submit'>Submit</button>
                        <button className='cabf__btn--func' onClick={handleClearInput}>Clear</button>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default ClassAddBroad