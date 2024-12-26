import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import toast from '@/helper/Toast';

function ClassInfoPage({isTeacher = false}) {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [classInfo, setClassInfo] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);
    const [imageUrl, setImageUrl] = useState(null);
    const [description, setDescription] = useState("");
    const [isEditDes, setIsEditDes] = useState(false);
    const imgClassRef = useRef(null);
    const inputNumRef = useRef(null);
    const inputStartRef = useRef(null);
    const inputEndRef = useRef(null);

    const getClassInfo = async () => {
        try {
            const response = await appClient.get(`api/classes/${classId}`);
            const dataRes = response.data;
            if (dataRes.success) {
                setClassInfo(dataRes.message);
                setImageUrl(APP_URL + dataRes.message.imageUrl)
                setDescription(dataRes.message.description ?? "");

                inputStartRef.current.value = dataRes.message.startDate;
                inputEndRef.current.value = dataRes.message.endDate;
                inputNumRef.current.value = dataRes.message.maxNum;
            }
        }
        catch {

        }
    }
    useEffect(() => {
        if (!classId) {
            navigate("/");
            return;
        }

        getClassInfo();
    }, [])

    const handleChangeFile = (event) => {
        const file = event.target.files[0];

        if (file) {
            setSelectedFile(file);
            setImageUrl(URL.createObjectURL(file));
        }
    }

    const handleClickImageClass = (event) => {
        imgClassRef.current.click();
    }

    const handleSaveDescription = async (event) => {
        if (!isEditDes) {
            setIsEditDes(!isEditDes);
        }
        else {
            try {
                const response = await appClient.patch(`api/classes/${classId}/des`, description, {
                    headers: {
                        "Content-Type": 'application/json',
                    }
                })
                const data = response.data;
                if (data.success) {
                    setIsEditDes(!isEditDes);
                    toast({
                        type: "success",
                        title: "Success",
                        message: "Update description successfully",
                        duration: 4000
                    });
                }
            }
            catch {

            }
        }
    }

    const handleChangeMaxMember = async (event) => {
        if (inputNumRef.current) {
            inputNumRef.current.value = event.target.value.replace(/[^0-9]/g, '');
        }
    }

    const handleUpdateInfo = async () => {
        if (inputNumRef.current && (inputNumRef.current.value == "" || inputNumRef.current.value == null)) {
            toast({
                type: "error",
                title: "Error",
                message: "Max number is required",
                duration: 4000
            });

            inputNumRef.current.focus();
            inputNumRef.current.value = classInfo?.maxNum;

            inputNumRef.current.classList.toggle("cabf__input--error");

            setTimeout(() => {
                inputNumRef.current.classList.toggle("cabf__input--error");
            }, 2000);

            return;
        }

        if (inputStartRef.current && (inputStartRef.current.value == "" || inputStartRef.current.value == null)) {
            toast({
                type: "error",
                title: "Error",
                message: "Start date is required",
                duration: 4000
            });

            inputStartRef.current.focus();
            inputStartRef.current.value = classInfo?.startDate;

            inputStartRef.current.classList.toggle("cabf__input--error");

            setTimeout(() => {
                inputStartRef.current.classList.toggle("cabf__input--error");
            }, 2000);

            return;
        }


        if (inputEndRef.current && (inputEndRef.current.value == "" || inputEndRef.current.value == null)) {
            toast({
                type: "error",
                title: "Error",
                message: "End date is required",
                duration: 4000
            });

            inputEndRef.current.focus();
            inputEndRef.current.value = classInfo?.endDate;

            inputEndRef.current.classList.toggle("cabf__input--error");

            setTimeout(() => {
                inputEndRef.current.classList.toggle("cabf__input--error");
            }, 2000);

            return;
        }

        try {
            const formData = new FormData();
            formData.append("ClassId", classInfo.classId);
            formData.append("CourseId", classInfo.courseId);
            formData.append("TeacherId", classInfo.teacher.teacherId);
            formData.append("ClassId", classInfo.classId);
            formData.append("StartDate", inputStartRef.current.value);
            formData.append("EndDate", inputEndRef.current.value);
            formData.append("MaxNum", inputNumRef.current.value);
            formData.append("Description", description);

            if (selectedFile) {
                formData.append("Image", selectedFile);
            }

            let response = await appClient.put(`api/classes/${classId}`, formData)
            let dataRes = response.data;

            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Success",
                    message: "Update class information successfully",
                    duration: 4000
                });

                getClassInfo();
            }
        }
        catch {

        }
    }

    const handleOpenClass = async () => {
        try {
            const response = await appClient.put(`api/enrolls/class/${classId}/handle-start`)
            const dataRes = response.data;

            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Success",
                    message: "Update class information successfully",
                    duration: 4000
                });
                getClassInfo();
            }
        }
        catch {

        }
    }

    const handleEndClass = async () => {
        try {
            const response = await appClient.put(`api/enrolls/class/${classId}/handle-end`)
            const dataRes = response.data;

            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Success",
                    message: "Update class information successfully",
                    duration: 4000
                });
                getClassInfo();
            }
        }
        catch {

        }
    }


    return (
        <div className='cip__wrapper w-full flex flex-col overflow-visible'>
            <div className='cip__img-wrapper overflow-visible'>
                <input
                    type='file'
                    className='hidden'
                    onChange={handleChangeFile} ref={imgClassRef}
                    accept='image/*' />
                <img src={(imageUrl == null || imageUrl == "") ? IMG_URL_BASE + "default_bg.jpg" : imageUrl} className='cip__image-class' onClick={handleClickImageClass} />
                <div className='cip__teacher--wrapper flex items-center justify-between w-full '>
                    <img src={classInfo?.teacher?.imageUrl == null ? IMG_URL_BASE + "unknown_user.jpg" : APP_URL + classInfo.teacher.imageUrl} className='cip__image-teacher' />
                    <div className='flex-1 flex flex-col items-start ml-[20px]'>
                        <div className='cip__teacher-name'>{classInfo?.teacher?.fullName}</div>
                        <div className='w-full flex items-center'>
                            <textarea className='cip__class-des flex-1' readOnly={!isEditDes} rows={2} value={description ?? ""} onChange={(e) => setDescription(e.target.value)} />
                            <button className='p-[4px]' onClick={handleSaveDescription}>
                                {
                                    !isEditDes ?
                                        <img src={IMG_URL_BASE + "edit-icon.svg"} className='w-[25px] p-[3px]' />
                                        :
                                        <img src={IMG_URL_BASE + "check_thin_icon.svg"} className='w-[25px]' />
                                }
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className='mt-[180px] px-[20px]'>
                <div className='flex items-center'>
                    <div className='cip__info--title'>
                        Max Members:
                    </div>
                    <input className='cip__info--input' ref={inputNumRef} onChange={(e) => handleChangeMaxMember(e)} />
                </div>

                <div className='flex items-center mt-[20px]'>
                    <div className='flex items-center flex-1'>
                        <div className='cip__info--title'>
                            Start Date:
                        </div>
                        <input className='cip__info--input' ref={inputStartRef} type='date' readOnly={classInfo.status != "Waiting" && isTeacher} />
                    </div>


                    <div className='flex items-center  flex-1'>
                        <div className='cip__info--title'>
                            End Date:
                        </div>
                        <input className='cip__info--input' type='date' ref={inputEndRef} readOnly={classInfo.status != "Waiting"  && isTeacher} />
                    </div>
                </div>

                <div className='flex items-center mt-[20px]'>
                    <div className='cip__info--title'>
                        Status:
                    </div>

                    <div className='cip__info--status'>{classInfo.status}</div>
                </div>

                <div className='flex justify-end items-center mt-[20px]'>
                    {classInfo.status == "Waiting" && <div className='cip__btn--func mr-[20px] open' onClick={handleOpenClass}>Open</div>}
                    {classInfo.status == "Opening" && <div className='cip__btn--func mr-[20px] end' onClick={handleEndClass}>End</div>}
                    <div className='cip__btn--func' onClick={handleUpdateInfo}>Update</div>
                </div>
            </div>
        </div>
    )
}

export default ClassInfoPage