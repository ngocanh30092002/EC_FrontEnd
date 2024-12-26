import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import toast from '@/helper/Toast';

function CourseInfoPage() {
    const [courseInfo, setCourseInfo] = useState({});
    const [isEditName, setIsEditName] = useState(false);
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [selectedImageThumbFile, setSelectedImageThumbFile] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [imageThumbUrl, setImageThumbUrl] = useState(null);
    const [isSequential, setIsSequential] = useState(true);
    const { courseId } = useParams();
    const navigate = useNavigate();

    const imageCouresRef = useRef(null);
    const imageThumbCouresRef = useRef(null);
    const inputNameRef = useRef(null);
    const inputDesRef = useRef(null);
    const inputEntryRef = useRef(null);
    const inputStandardRef = useRef(null);
    const inputPriorityRef = useRef(null);

    const getCourseInfo = async () => {
        try {
            const response = await appClient.get(`api/Courses/${courseId}`);
            const dataRes = response.data;
            if (dataRes.success) {
                setCourseInfo(dataRes.message);
                setImageUrl(APP_URL + dataRes.message.imageUrl)
                setImageThumbUrl(APP_URL + dataRes.message.imageThumbnailUrl)
                inputNameRef.current.value = dataRes.message.name;
                inputDesRef.current.value = dataRes.message.description;
                inputEntryRef.current.value = dataRes.message.entryPoint;
                inputStandardRef.current.value = dataRes.message.standardPoint;
                inputPriorityRef.current.value = dataRes.message.priority;
                setIsSequential(dataRes.message.isSequential)
            }
        }
        catch {

        }
    }

    const handleChangeFile = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImageFile(file);
            setImageUrl(URL.createObjectURL(file));
        }
    }

    const handleChangeFileThumb = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedImageThumbFile(file);
            setImageThumbUrl(URL.createObjectURL(file));
        }
    }

    useEffect(() => {
        if (courseId == null) {
            navigate(-1);
            return;
        }

        getCourseInfo();
    }, [])

    const handleClickImage = () => {
        imageCouresRef.current.click();
    }

    const handleClickThumb = () => {
        imageThumbCouresRef.current.click();
    }

    const handleChangePriority = (event) => {
        if (inputPriorityRef.current) {
            inputPriorityRef.current.value = event.target.value.replace(/[^0-9]/g, '');
        }
    }

    const handleChangeEntry = (event) => {
        if (inputEntryRef.current) {
            const value = event.target.value.replace(/[^0-9]/g, '');
            const inputValue = parseInt(value == "" ? 0 : value);
            if (inputValue < 0 || inputValue > 990) {
                inputEntryRef.current.value = "";
            }
            else {
                inputEntryRef.current.value = value;
            }
        }
    }

    const handleChangeStandard = (event) => {
        if (inputStandardRef.current) {
            const value = event.target.value.replace(/[^0-9]/g, '');
            const inputValue = parseInt(value == "" ? 0 : value);
            if (inputValue < 0 || inputValue > 990) {
                inputStandardRef.current.value = "";
            }
            else {
                inputStandardRef.current.value = value;
            }
        }
    }

    const handleSubmitCourseInfo = async (event) => {
        event.preventDefault();


        try {
            if (inputNameRef.current && (inputNameRef.current.value == "" || inputNameRef.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Image is required",
                    duration: 4000
                });

                inputNameRef.current.classList.toggle("input-error");
                inputNameRef.current.focus();

                setTimeout(() => {
                    inputNameRef.current.classList.toggle("input-error");
                }, 2000);

                return;
            }

            if (inputEntryRef.current.value != "" && inputStandardRef.current.value != "") {
                var entryNum = parseInt(inputEntryRef.current.value);
                var standardNum = parseInt(inputStandardRef.current.value);

                if (standardNum < entryNum) {
                    toast({
                        type: "error",
                        title: "ERROR",
                        message: "Standard must be greater than entry",
                        duration: 4000
                    });

                    inputEntryRef.current.classList.toggle("input-error");
                    inputEntryRef.current.focus();

                    setTimeout(() => {
                        inputEntryRef.current.classList.toggle("input-error");
                    }, 2000);

                    return;
                }
            }

            const formData = new FormData(event.target);
            formData.append("CourseId", courseId);
            
            if (selectedImageFile != null) {
                formData.append("Image", selectedImageFile);
            }

            if (selectedImageThumbFile != null) {
                formData.append("ImageThumbnail", selectedImageThumbFile);
            }

            const response = await appClient.put(`api/courses/${courseId}`, formData)
            const dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Success",
                    message: "Update course successfully",
                    duration: 4000
                });

                getCourseInfo();
                return;
            }
        }
        catch {

        }
    }

    return (
        <div className='cip__wrapper w-full flex flex-col overflow-visible'>
            <form className='cip__img-wrapper overflow-visible' method='POST' onSubmit={handleSubmitCourseInfo}>
                <div className='flex-col relative flex items-center justify-between w-full overflow-visible'>
                    <input
                        type='file'
                        className='hidden'
                        onChange={handleChangeFile} ref={imageCouresRef}
                        accept='image/*' />
                    <img src={(imageUrl == null || imageUrl == "") ? IMG_URL_BASE + "default_bg.jpg" : imageUrl} className='cip__image-class' onClick={handleClickImage} />
                    <div className='flex items-center absolute bottom-[-40%] left-0 ml-[50px] translate-y-[8%] h-fit overflow-visible'>
                        <img src={(imageThumbUrl == null || imageThumbUrl == "") ? IMG_URL_BASE + "default_bg.jpg" : imageThumbUrl} className='cip__image-teacher cursor-pointer' onClick={handleClickThumb} />
                        <input
                            type='file'
                            className='hidden'
                            onChange={handleChangeFileThumb} ref={imageThumbCouresRef}
                            accept='image/*' />

                        <div className='flex-1 flex flex-col items-start ml-[20px]'>
                            <div className='w-full flex items-start flex-col'>
                                <div className='flex relative overflow-visible'>
                                    <div className='cip__course-name'>{courseInfo.courseId}</div>
                                </div>
                                <div className='cip__course-id'># {courseInfo.courseId}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='mt-[180px] px-[20px]'>
                    <div className="flex items-center">
                        <div className='flex items-center flex-1'>
                            <div className='cip__info--title'>
                                Name:
                            </div>
                            <input className='cip__info--input' ref={inputNameRef} name='Name' />
                        </div>

                    </div>

                    <div className='flex items-center mt-[20px]'>
                        <div className='flex items-center flex-1'>
                            <div className='cip__info--title'>
                                Entry Point:
                            </div>
                            <input className='cip__info--input' ref={inputEntryRef} name='EntryPoint' onChange={handleChangeEntry} />
                        </div>


                        <div className='flex items-center  flex-1'>
                            <div className='cip__info--title'>
                                Standard Point:
                            </div>
                            <input className='cip__info--input' name='StandardPoint' onChange={handleChangeStandard} ref={inputStandardRef} />
                        </div>
                    </div>

                    <div className='flex items-center mt-[20px]'>
                        <div className='flex items-center flex-1'>
                            <div className='cab__title--text h-[43px]'>Sequential</div>
                            <div className='flex w-full justify-around'>
                                <div className="flex items-center">
                                    <input type='radio' id="sequential" name='IsSequential' value={true} checked={isSequential} onChange={(e) => setIsSequential(true)} />
                                    <label className='cab__title--lbl' htmlFor='sequential'>Yes</label>
                                </div>
                                <div className="flex items-center">
                                    <input type='radio' id='no-sequential' name='IsSequential' value={false} checked={!isSequential} onChange={(e) => setIsSequential(false)} />
                                    <label className='cab__title--lbl' htmlFor='no-sequential'>No</label>
                                </div>
                            </div>
                        </div>
                        <div className='flex items-center flex-1'>
                            <div className='cip__info--title'>
                                Priority:
                            </div>
                            <input className='cip__info--input' name='Priority' ref={inputPriorityRef} onChange={handleChangePriority} />

                        </div>
                    </div>

                    <div className='flex mt-[20px]'>
                        <div className='cip__info--title'>
                            Description:
                        </div>
                        <textarea rows={3} className='cip__info--input resize-none' name='Description' ref={inputDesRef} />
                    </div>

                    <div className='flex justify-end mt-[20px]'>
                        <button className='cip__btn--func' type="submit">Update</button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default CourseInfoPage