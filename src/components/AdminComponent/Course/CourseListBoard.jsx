import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import toast from '@/helper/Toast';

function CourseListBoard({ isTeacher = false }) {
    const [isShowCourseBoard, setIsShowCourseBroad] = useState(false);
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [courses, setCourses] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowPerPage = 6;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(courses.length / rowPerPage);

    const getCoursesInfo = async () => {
        try {
            const response = await appClient.get("api/courses");
            const dataRes = response.data;
            if (dataRes.success) {
                setCourses(dataRes.message.map((item, index) => ({ ...item, index: index + 1 })));
            }
        }
        catch {

        }
    }

    const handleChangePage = (event) => {
        if (event.target.value == "") {
            setCurrentPage(1);
        }
        else {
            setCurrentPage(event.target.value.replace(/[^0-9]/g, ''));
        }
    }

    const handleInputPage = (event) => {
        setCurrentPage(currentPage.replace(/[^0-9]/g, ''));
    }

    const handleDeleteCourse = (courseId) => {
        let newCourses = courses.filter(c => c.courseId != courseId);
        newCourses = newCourses.map((item, index) => ({ ...item, index: index + 1 }));
        setCourses(newCourses);
    }

    const removeVietnameseAccents = (str) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D");
    }


    const handleSort = (key, event) => {
        setSortConfig(prevConfig => {
            const existingIndex = prevConfig.findIndex((item) => item.key === key);
            event.target.classList.add("active");

            if (existingIndex > -1) {
                const updatedConfig = [...prevConfig];
                const currentDirection = updatedConfig[existingIndex].direction;

                if (currentDirection === 'desc') {
                    updatedConfig[existingIndex].direction = 'asc';
                    event.target.classList.remove("desc");
                } else {
                    updatedConfig.splice(existingIndex, 1);
                    event.target.classList.toggle("active");
                }

                return updatedConfig;
            }

            event.target.classList.add("desc");
            return [...prevConfig, { key, direction: 'desc' }];
        });
    }

    const getValueByPath = (object, path) => {
        return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), object);
    };

    const sortedDataFunc = () => {
        if (sortConfig.length === 0) return [...courses];

        return [...courses].sort((a, b) => {
            for (const { key, direction } of sortConfig) {
                const valueA = getValueByPath(a, key);
                const valueB = getValueByPath(b, key);

                if (valueA == null && valueB == null) {
                    continue;
                }
                if (valueA == null) {
                    return direction === "asc" ? -1 : 1;
                }
                if (valueB == null) {
                    return direction === "asc" ? 1 : -1;
                }

                if (valueA < valueB) {
                    return direction === "asc" ? -1 : 1;
                }
                if (valueA > valueB) {
                    return direction === "asc" ? 1 : -1;
                }
            }
            return 0;
        });
    };

    useEffect(() => {
        getCoursesInfo();
    }, [])

    useEffect(() => {
        setSortedData(sortedDataFunc());
    }, [courses, sortConfig])

    useEffect(() => {
        if (searchValue != "") {
            setSortedData(prev => {
                let newPrev = prev.filter(item => {
                    const fullName = removeVietnameseAccents(item.name).toLowerCase();
                    const search = removeVietnameseAccents(searchValue.toLowerCase());
                    return fullName.includes(search);
                })
                return newPrev;
            })
        }
        else {
            setSortedData(sortedDataFunc());
        }
    }, [searchValue])

    const handleReloadCourse = () => {
        getCoursesInfo();
    }

    return (
        <div className='cmp__wrapper p-[20px] h-full'>
            <div className='flex justify-between items-center'>
                <div className='cmp__title'>List of Courses</div>
                <div className="flex items-center">
                    <div className="flex items-center">
                        <div className='mpt__header-item--search-icon'>
                            <img src={IMG_URL_BASE + "search_icon.svg"} className='w-[30px] p-[6px]' />
                        </div>
                        <input placeholder='Search ...' className='mpt__header-item--search !mr-0' value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                    </div>
                    {
                        isTeacher == false &&
                        <button className='cmp__add-class--btn ml-[20px]' onClick={(e) => setIsShowCourseBroad(!isShowCourseBoard)}>
                            {
                                !isShowCourseBoard ?
                                    "Add Course"
                                    :
                                    "Hide Board"
                            }
                        </button>
                    }
                </div>
            </div>

            <CourseAddBoard isShow={isShowCourseBoard} onShow={setIsShowCourseBroad} onReloadCourse={handleReloadCourse} />


            <div className='clb__wrapper'>
                <div className="clb__tbl__wrapper mt-[20px] ">
                    <div className="mpt__header flex w-full items-center">
                        <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("index", event)}>No</div>
                        <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("courseId", event)}>Course Info</div>
                        <div className="mpt__header-item w-1/6" onClick={(event) => handleSort("description", event)}>Description</div>
                        <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("entryPoint", event)}>Entry</div>
                        <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("standardPoint", event)}>Standard</div>
                        <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("priority", event)}>Priority</div>
                        <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("numLesson", event)}>Lessons</div>
                        <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("isSequential", event)}>Sequential</div>
                        <div className="mpt__header-item w-1/12"></div>
                    </div>

                    <div className='mpt__body min-h-[480px] mt-[10px]'>
                        {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                            return (
                                <CourseItem
                                    courseInfo={item}
                                    key={index}
                                    index={item.index}
                                    onDeleteCourse={handleDeleteCourse}
                                    isTeacher={isTeacher}
                                />
                            )
                        })}
                    </div>

                    <div className='flex justify-end items-center mt-[20px]'>
                        <button className='mpt__page-btn' onClick={(e) => setCurrentPage(prev => 1)}>
                            <img src={IMG_URL_BASE + "previous.svg"} className="w-[25px] " />
                        </button>

                        <button className='mpt__page-btn' onClick={(e) => setCurrentPage(prev => {

                            return prev == 1 ? 1 : parseInt(prev) - 1;
                        })}>
                            <img src={IMG_URL_BASE + "pre_page_icon.svg"} className="w-[25px]" />
                        </button>

                        <input className='mpt__page-input' value={currentPage} onChange={handleChangePage} onInput={handleInputPage} />

                        <button className='mpt__page-btn' onClick={(e) => setCurrentPage(prev => parseInt(prev) + 1)}>
                            <img src={IMG_URL_BASE + "next_page_icon.svg"} className="w-[25px]" />
                        </button>

                        <button className='mpt__page-btn' onClick={(e) => setCurrentPage(prev => totalPage)}>
                            <img src={IMG_URL_BASE + "next.svg"} className="w-[25px]" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function CourseItem({ courseInfo, index, onDeleteCourse, isTeacher }) {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [isShow, setIsShow] = useState(false);

    const handleShowCourseInfo = () => {
        setIsShow(true);

        navigate(`${courseInfo.courseId}/detail`);
    }
    const handleRemoveClick = async (event) => {
        event.stopPropagation();

        try {
            var confirmAnswer = confirm("Are you sure to delete this courses");
            if (!confirmAnswer) return;

            const response = await appClient.delete(`api/courses/${courseInfo.courseId}`);
            const dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Successfully",
                    message: "Delete class successfully",
                    duration: 4000
                });

                onDeleteCourse(courseInfo.courseId);

                return;
            }
        }
        catch {

        }
    }
    return (
        <div className={`mpt__row flex items-center mb-[10px] ${isEditing && "editing"}`} onClick={handleShowCourseInfo}>
            <div className="mpt__row-item w-1/12 "># {index}</div>
            <div className="mpt__row-item w-1/4 flex items-center ">
                <div>
                    <img src={courseInfo?.imageUrl == null ? IMG_URL_BASE + "default_bg.jpg" : APP_URL + courseInfo.imageUrl} className='w-[50px] h-[50px] object-cover rounded-[50%]' />
                </div>
                <div className='flex flex-col items-start ml-[12px]'>
                    <div className='mpt__row-item-course'>{courseInfo.name}</div>
                    <div className='mpt__row-item-course'>{courseInfo.courseId}</div>
                </div>
            </div>
            <div className="mpt__row-item w-1/6 line-clamp-2 !p-0">
                {courseInfo.description}
            </div>
            <div className="mpt__row-item w-1/12">{courseInfo.entryPoint ?? "No"}</div>
            <div className="mpt__row-item w-1/12">{courseInfo.standardPoint ?? "No"}</div>
            <div className="mpt__row-item w-1/12">{courseInfo.priority ?? "No"}</div>
            <div className="mpt__row-item w-1/12">{courseInfo.numLesson}</div>
            <div className="mpt__row-item w-1/12">{courseInfo.isSequential ? "Yes" : "No"}</div>
            <div className="mpt__row-item w-1/12">
                {
                    !isTeacher &&
                    <button className='mpt__item--btn' onClick={handleRemoveClick}>
                        <img src={IMG_URL_BASE + "close.svg"} className='w-[25px] p-[3px]' />
                    </button>
                }
            </div>
        </div>
    )
}

function CourseAddBoard({ isShow, onShow, onReloadCourse }) {
    const [isSequential, setIsSequential] = useState(true);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedImageThumb, setSelectedImageThumb] = useState(null);

    const inputCourseIdRef = useRef(null);
    const inputCourseNameRef = useRef(null);
    const inputDesRef = useRef(null);
    const inputPriorityRef = useRef(null);
    const inputEntryRef = useRef(null);
    const inputStandardRef = useRef(null);
    const inputImageRef = useRef(null);
    const inputImageNameRef = useRef(null);
    const inputImageThumbRef = useRef(null);
    const inputImageThumbNameRef = useRef(null);

    const handleImageClick = () => {
        inputImageRef.current.click();
    }

    const handleImageThumbClick = () => {
        inputImageThumbRef.current.click();
    }

    const handleChangeImage = (event) => {
        let file = event.target.files[0];
        if (file) {
            setSelectedImage(file);
            if (inputImageNameRef.current) {
                inputImageNameRef.current.value = file.name;
            }
        }

        event.target.value = "";
    }

    const handleChangeImageThumb = (event) => {
        let file = event.target.files[0];
        if (file) {
            setSelectedImageThumb(file);
            inputImageThumbNameRef.current.value = file.name;
        }
        event.target.value = "";
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

    const handleResetInput = (event) => {
        if (event) event.preventDefault();
        inputCourseIdRef.current.value = "";
        inputCourseNameRef.current.value = "";
        inputCourseIdRef.current.value = "";
        inputImageNameRef.current.value = "";
        inputImageThumbNameRef.current.value = "";
        setSelectedImage(null);
        setSelectedImageThumb(null);
        setIsSequential(true);
        inputEntryRef.current.value = "0";
        inputStandardRef.current.value = "0";
        inputPriorityRef.current.value = "";
        inputDesRef.current.value = "";

    }
    useEffect(() => {
        handleResetInput();
    }, [])

    const handleSubmitCourse = async (event) => {
        event.preventDefault();

        try {
            if (inputCourseIdRef.current && (inputCourseIdRef.current.value == "" || inputCourseIdRef.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Course Id is required",
                    duration: 4000
                });

                inputCourseIdRef.current.classList.toggle("input-error");
                inputCourseIdRef.current.focus();

                setTimeout(() => {
                    inputCourseIdRef.current.classList.toggle("input-error");
                }, 2000);

                return;
            }

            if (inputCourseNameRef.current && (inputCourseNameRef.current.value == "" || inputCourseNameRef.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Course name is required",
                    duration: 4000
                });

                inputCourseNameRef.current.classList.toggle("input-error");
                inputCourseNameRef.current.focus();

                setTimeout(() => {
                    inputCourseNameRef.current.classList.toggle("input-error");
                }, 2000);

                return;
            }

            if (!selectedImage) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Image is required",
                    duration: 4000
                });

                inputImageNameRef.current.classList.toggle("input-error");
                inputImageNameRef.current.focus();

                setTimeout(() => {
                    inputImageNameRef.current.classList.toggle("input-error");
                }, 2000);

                return;
            }

            if (!selectedImageThumb) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Image is required",
                    duration: 4000
                });

                inputImageThumbNameRef.current.classList.toggle("input-error");
                inputImageThumbNameRef.current.focus();

                setTimeout(() => {
                    inputImageThumbNameRef.current.classList.toggle("input-error");
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
            formData.append("Image" , selectedImage)
            formData.append("ImageThumbnail" , selectedImageThumb)

            const resposne = await appClient.post("api/courses", formData);
            const dataRes = resposne.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Success",
                    message: "Create course successfully",
                    duration: 4000
                });

                handleResetInput();
                onShow(false);
                onReloadCourse();
            }
        }
        catch (err) {
           
        }
    }
    return (
        <div className={`w-full h-[450px] mt-[20px] cab__wrapper p-[20px] border rounded-[10px] overflow-visible ${isShow ? "block" : "hidden"} p-[10px]`}>
            <form className='flex flex-col p-[20px]' onSubmit={handleSubmitCourse}>
                <div className="flex items-center">
                    <div className="flex items-center flex-1">
                        <div className='cab__title--text'>CourseId</div>
                        <input
                            maxLength={10}
                            name='CourseId'
                            className='cab__input-text uppercase'
                            ref={inputCourseIdRef}
                        />
                    </div>
                    <div className="flex items-center flex-1 ml-[20px]">
                        <div className='cab__title--text'>Course Name</div>
                        <input
                            name='Name'
                            className='cab__input-text'
                            ref={inputCourseNameRef}
                        />
                    </div>
                </div>

                <div className="flex items-center mt-[20px]">
                    <div className="flex items-center flex-1">
                        <div className='cab__title--text'>Image</div>
                        <input
                            maxLength={10}
                            className='cab__input-text cursor-pointer'
                            onClick={handleImageClick}
                            placeholder='Upload image course...'
                            ref={inputImageNameRef}
                        />
                        <input className='hidden' ref={inputImageRef} type='file' multiple={false} accept='image/*' name='Image' onChange={handleChangeImage} />
                    </div>
                    <div className="flex items-center flex-1">
                        <div className='cab__title--text'>Image Thumb</div>
                        <input
                            className='cab__input-text cursor-pointer'
                            onClick={handleImageThumbClick}
                            placeholder='Upload image thumbnail course...'
                            ref={inputImageThumbNameRef}
                        />
                        <input className='hidden' type='file' ref={inputImageThumbRef} name='ImageThumbnail' multiple={false} accept='image/*' onChange={handleChangeImageThumb} />
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
                        <div className='flex justify-center flex-1'>
                            <div className='cab__title--text'>Priority</div>
                            <input
                                name='Priority'
                                className='cab__input-text'
                                ref={inputPriorityRef}
                                onChange={handleChangePriority}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex items-center mt-[20px]">
                    <div className="flex items-center flex-1">
                        <div className='cab__title--text'>Entry Point</div>
                        <input
                            name='EntryPoint'
                            className='cab__input-text'
                            ref={inputEntryRef}
                            onChange={handleChangeEntry}
                        />
                    </div>
                    <div className="flex items-center flex-1">
                        <div className='cab__title--text'>Standard Point</div>
                        <input
                            name='StandardPoint'
                            className='cab__input-text'
                            ref={inputStandardRef}
                            onChange={handleChangeStandard}
                        />
                    </div>
                </div>

                <div className="flex items-center mt-[20px]">
                    <div className="flex items-start flex-1">
                        <div className='cab__title--text'>Description</div>
                        <textarea
                            rows={3}
                            name='Description'
                            className='cab__input-text resize-none'
                            ref={inputDesRef}
                            placeholder='Enter description ...'
                        />
                    </div>
                </div>

                <div className="flex justify-end mt-[20px]">
                    <button className='cabf__btn--func' onClick={handleResetInput}>
                        Clear
                    </button>

                    <button className='cabf__btn--func' type='submit'>
                        Create Course
                    </button>
                </div>
            </form>
        </div>
    )
}

export default CourseListBoard