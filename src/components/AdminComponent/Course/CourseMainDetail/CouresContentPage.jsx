import React, { useEffect, useRef, useState } from 'react'
import { Route, Routes, useNavigate, useParams } from 'react-router-dom'
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE } from '~/GlobalConstant.js';
import DropDownList from '../../../CommonComponent/DropDownList';
import toast from '@/helper/Toast';
import CourseContentAssignment from './CourseContentAssignment';
import CourseExamination from './CourseExamination';
import LoaderPage from '../../../LoaderComponent/LoaderPage';

function CouresContentPage() {
    return (
        <Routes>
            <Route path='/' element={<CourseContentList />} />
            <Route path=':contentId/assignment' element={<CourseContentAssignment />} />
            <Route path=':contentId/examination' element={<CourseExamination />} />
        </Routes>
    )
}


function CourseContentList() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const [isShowBoard, setIsShowBoard] = useState(false);
    const [courseContents, setCourseContents] = useState([]);
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowPerPage = 6;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(courseContents.length / rowPerPage);

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

    const getCourseContents = async () => {
        try {
            const response = await appClient.get(`api/CourseContent/course/${courseId}`);
            const dataRes = response.data;
            if (dataRes.success) {
                setCourseContents(dataRes.message.map((item, index) => ({ ...item, index: index + 1 })));
            }
        }
        catch {

        }
    }

    const handleDeleteContent = (contentId) => {
        let newCourseContent = courseContents.filter(c => c.contentId != contentId);
        newCourseContent = newCourseContent.map((item, index) => ({ ...item, index: index + 1 }));
        setCourseContents(newCourseContent);
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

    const removeVietnameseAccents = (str) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D");
    }


    const getValueByPath = (object, path) => {
        return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), object);
    };

    const sortedDataFunc = () => {
        if (sortConfig.length === 0) return [...courseContents];

        return [...courseContents].sort((a, b) => {
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
        if (courseId == null) {
            navigate(-1);
            return;
        }

        getCourseContents();
    }, [])


    useEffect(() => {
        setSortedData(sortedDataFunc());
    }, [courseContents, sortConfig])

    useEffect(() => {
        if (searchValue != "") {
            setSortedData(prev => {
                let newPrev = prev.filter(item => {
                    const fullName = removeVietnameseAccents(item.title).toLowerCase();
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

    const handleReloadContents = () => {
        getCourseContents();
    }

    return (
        <div className='ccp__wrapper px-[20px]'>
            <div className='flex justify-between items-center'>
                <div className='cmp__title'>List of Contents</div>
                <div className="flex items-center">
                    <div className="flex items-center">
                        <div className='mpt__header-item--search-icon'>
                            <img src={IMG_URL_BASE + "search_icon.svg"} className='w-[30px] p-[6px]' />
                        </div>
                        <input placeholder='Search ...' className='mpt__header-item--search' value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                    </div>
                    <button className='cmp__add-class--btn' onClick={(e) => setIsShowBoard(!isShowBoard)}>
                        {
                            !isShowBoard ?
                                "Add Content"
                                :
                                "Hide Board"
                        }
                    </button>
                </div>
            </div>

            <CourseContentAddBoard isShow={isShowBoard} onShow={setIsShowBoard} courseId={courseId} onReloadContents={handleReloadContents} />

            <div className="clb__tbl__wrapper mt-[20px]">
                <div className="mpt__header flex w-full">
                    <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("noNum", event)}>No</div>
                    <div className="mpt__header-item w-1/3" onClick={(event) => handleSort("title", event)}>Title</div>
                    <div className="mpt__header-item w-1/3" onClick={(event) => handleSort("content", event)}>Main Content</div>
                    <div className="mpt__header-item w-1/6" onClick={(event) => handleSort("type", event)}>Type</div>
                    <div className="mpt__header-item w-1/12"></div>
                </div>

                <div className='mpt__body min-h-[390px] mt-[10px]'>
                    {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                        return (
                            <CouresContentItem
                                courseContentInfo={item}
                                key={index}
                                index={item.index}
                                onDeleteCourseContent={handleDeleteContent}
                                onReloadContents={handleReloadContents}
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
    )
}

function CourseContentAddBoard({ isShow, onShow, courseId, onReloadContents }) {
    const [types, setTypes] = useState([]);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputNonumRef = useRef(null);
    const inputContentRef = useRef(null);
    const inputTitleRef = useRef(null);

    useEffect(() => {
        const getTypes = async () => {
            try {
                const response = await appClient.get("api/coursecontent/types");
                const dataRes = response.data;
                if (dataRes.success) {
                    setTypes(dataRes.message);
                }
            }
            catch {

            }
        }

        getTypes();

    }, [])

    const handleClearInput = (event) => {
        if (event) event.preventDefault();
        inputTitleRef.current.value = "";
        inputContentRef.current.value = "";
        inputNonumRef.current.value = "";
    }

    const handleChangeType = (item, index) => {
        setSelectedType(item);
        setSelectedIndex(index);
    }

    const handleSubmitForm = async (event) => {
        event.preventDefault();

        try {
            if (inputTitleRef.current && (inputTitleRef.current.value == "" || inputTitleRef.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Course Id is required",
                    duration: 4000
                });

                inputTitleRef.current.classList.toggle("input-error");
                inputTitleRef.current.focus();

                setTimeout(() => {
                    inputTitleRef.current.classList.toggle("input-error");
                }, 2000);

                return;
            }

            if (inputContentRef.current && (inputContentRef.current.value == "" || inputContentRef.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Course Id is required",
                    duration: 4000
                });

                inputContentRef.current.classList.toggle("input-error");
                inputContentRef.current.focus();

                setTimeout(() => {
                    inputContentRef.current.classList.toggle("input-error");
                }, 2000);

                return;
            }

            const formData = new FormData(event.target);
            formData.append("Type", selectedType == null ? 1 : selectedType.value);

            const response = await appClient.post("api/coursecontent", formData);
            const dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Success",
                    message: "Create course successfully",
                    duration: 4000
                });

                handleClearInput();
                onShow(false);
                onReloadContents();
            }

        }
        catch {

        }
    }

    const handleChangeNonum = (event) => {
        if (inputNonumRef.current) {
            inputNonumRef.current.value = event.target.value.replace(/[^0-9]/g, '');
        }
    }
    return (
        <form onSubmit={handleSubmitForm} className={`w-full min-h-[300px] mt-[20px] flex flex-col cab__wrapper p-[20px] border rounded-[10px] overflow-visible ${isShow ? "block" : "hidden"} p-[10px]`}>
            <div className="flex items-center mt-[20px]">
                <div className="flex items-center flex-1">
                    <div className='cab__title--text'>Title</div>
                    <input
                        name='Title'
                        className='cab__input-text'
                        ref={inputTitleRef}
                    />
                </div>
                <div className="flex items-center flex-1">
                    <div className='cab__title--text'>Content</div>
                    <input
                        name='Content'
                        className='cab__input-text'
                        ref={inputContentRef}
                    />
                </div>

                <input name='CourseId' readOnly value={courseId} className='hidden' />
            </div>

            <div className="flex items-center mt-[20px] overflow-visible">
                <div className="flex items-center flex-1">
                    <div className='cab__title--text'>No Num</div>
                    <input
                        name='NoNum'
                        className='cab__input-text'
                        ref={inputNonumRef}
                        onChange={handleChangeNonum}
                    />
                </div>
                <div className="flex items-center flex-1 overflow-visible">
                    <div className='cab__title--text'>Type</div>

                    <DropDownList data={types} onSelectedItem={handleChangeType} hideDefault={true} defaultIndex={selectedIndex} className={"border-[#cccccc] border !rounded-[20px]"} />
                </div>
            </div>

            <div className="flex justify-end mt-[20px] items-end flex-1">
                <button className='cabf__btn--func h-[45px]' onClick={handleClearInput}>
                    Clear
                </button>
                <button className='cabf__btn--func h-[45px]' type='submit'>
                    Create
                </button>
            </div>
        </form>
    )
}

export function CouresContentItem({ index, courseContentInfo, onReloadContents, onDeleteCourseContent, isTeacher = false }) {
    const [courseType, setCourseType] = useState("");
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const inputTitleRef = useRef(null);
    const inputNoNumRef = useRef(null);
    const inputContentRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (courseContentInfo?.type == 1) {
            setCourseType("Normal");
        }
        if (courseContentInfo?.type == 2) {
            setCourseType("Entrance")
        }
        if (courseContentInfo?.type == 3) {
            setCourseType("Midterm");
        }
        if (courseContentInfo?.type == 4) {
            setCourseType("Final");
        }

        inputNoNumRef.current.value = courseContentInfo?.noNum;
        inputTitleRef.current.value = courseContentInfo?.title;
        inputContentRef.current.value = courseContentInfo?.content;
    }, [courseContentInfo])

    const handleChangeNoNum = (event) => {
        if (inputNoNumRef.current) {
            inputNoNumRef.current.value = event.target.value.replace(/[^0-9]/g, '');
        }
    }

    const handleRemoveClick = async (event) => {
        event.preventDefault();
        try {
            const confirmAnswer = confirm("Are you want to delete this item ?");
            if (confirmAnswer) {
                setIsLoading(true);
                const response = await appClient.delete(`api/CourseContent/${courseContentInfo.contentId}`);
                const dataRes = response.data;
                if (dataRes.success) {
                    toast({
                        type: "success",
                        title: "Successfully",
                        message: "Delete class successfully",
                        duration: 4000
                    });

                }
                onReloadContents();
            }

            setIsLoading(false);
        }
        catch {
            setIsLoading(false);
        }
    }

    const handleEditingClick = async (event) => {
        event.preventDefault();

        if (!isEditing) {
            setIsEditing(!isEditing);
        }
        else {
            const answerConfirm = confirm("Do you want to save this item ?");
            if (answerConfirm) {
                try {
                    setIsLoading(true);

                    const formData = new FormData();
                    formData.append("NoNum", inputNoNumRef.current.value);
                    formData.append("Title", inputTitleRef.current.value);
                    formData.append("Content", inputContentRef.current.value);
                    formData.append("CourseId", courseContentInfo.courseId);
                    formData.append("CourseId", courseContentInfo?.courseId);
                    formData.append("Type", courseContentInfo?.type);

                    const response = await appClient.put(`api/CourseContent/${courseContentInfo.contentId}`, formData);

                    const dataRes = response.data;

                    if (dataRes.success) {
                        toast({
                            type: "success",
                            title: "Successfully",
                            message: "Update contents successfully",
                            duration: 4000
                        });

                        onReloadContents()
                    }

                    setIsEditing(!isEditing);
                    setIsLoading(false);
                }
                catch (err) {
                    inputNoNumRef.current.value = courseContentInfo?.noNum;
                    inputTitleRef.current.value = courseContentInfo?.title;
                    inputContentRef.current.value = courseContentInfo?.content;
                    setIsEditing(!isEditing);
                    setIsLoading(false);
                }
            }
        }

    }

    const handleRedirectToCourseContent = () => {
        if (courseContentInfo?.type == 1) {
            navigate(`${courseContentInfo.contentId}/assignment`);
        }
        else {
            navigate(`${courseContentInfo.contentId}/examination`);
        }
    }

    return (
        <div className={`mpt__row flex items-center mb-[10px]`} onClick={handleRedirectToCourseContent}>
            <div className="mpt__row-item w-1/12 cci__row-item flex items-center" onClick={(e) => {
                if (isEditing) {
                    e.stopPropagation();
                }
            }}>
                #<input className={`${!isEditing && " cursor-pointer"} bg-transparent text-center cci__input-value w-[20px] ml-[10px] !px-[4px]`} onChange={handleChangeNoNum} ref={inputNoNumRef} readOnly={!isEditing} />
            </div>
            <div className="mpt__row-item w-1/3 cci__row-item" onClick={(e) => {
                if (isEditing) {
                    e.stopPropagation();
                }
            }}>
                <input className={`${!isEditing && "bg-transparent cursor-pointer"} cci__input-value w-full`} ref={inputTitleRef} readOnly={!isEditing} />
            </div>
            <div className="mpt__row-item w-1/3 cci__row-item line-clamp-2" onClick={(e) => {
                if (isEditing) {
                    e.stopPropagation();
                }
            }}>
                <input className={`${!isEditing && "bg-transparent cursor-pointer"} cci__input-value w-full`} ref={inputContentRef} readOnly={!isEditing} />
            </div>
            <div className="mpt__row-item w-1/6 cci__row-item">{courseType}</div    >
            <div className="mpt__row-item w-1/12 cci__row-item" onClick={(e) => e.stopPropagation()}>
                {
                    !isTeacher &&
                    <>
                        <button className='mpt__item--btn' onClick={handleEditingClick}>
                            {
                                !isEditing ?
                                    <img src={IMG_URL_BASE + "edit-icon.svg"} className='w-[25px] p-[3px]' /> :
                                    <img src={IMG_URL_BASE + "check_thin_icon.svg"} className='w-[25px]' />
                            }
                        </button>
                        <button className='mpt__item--btn' onClick={handleRemoveClick}>
                            <img src={IMG_URL_BASE + "close.svg"} className='w-[25px] p-[3px]' />
                        </button>
                    </>
                }
            </div>

            {isLoading && <LoaderPage/>}
        </div>
    )
}


export default CouresContentPage