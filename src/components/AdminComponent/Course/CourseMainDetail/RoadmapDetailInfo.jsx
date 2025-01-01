import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { appClient } from '~/AppConfigs';
import DropDownList from '../../../CommonComponent/DropDownList';
import MaskedInput from 'react-text-mask';
import { APP_URL, IMG_URL_BASE } from '~/GlobalConstant.js';
import { AnswerOptions } from './CourseExamination';
import toast from '@/helper/Toast';
import { QuestionToeicStandard } from '../../Class/ClassMain/ClassMainDetail/LessonHomework';
import LoaderPage from '../../../LoaderComponent/LoaderPage';

function RoadmapDetailInfo({ isTeacher = false }) {
    const { roadmapId } = useParams();
    const [isShowBoard, setIsShowBoard] = useState(false);
    const [roadMapExams, setRoadMapExams] = useState([]);
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowPerPage = 6;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(roadMapExams.length / rowPerPage);

    const getRoadMapExams = async () => {
        try {
            const response = await appClient.get(`api/roadmapexams/road-maps/${roadmapId}`);
            const data = response.data;
            if (data.success) {
                setRoadMapExams(data.message.map((item, index) => ({ ...item, index: index + 1 })));
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

    const handleDeleteAssignment = (id) => {
        let newRoadMapExams = roadMapExams.filter(c => c.id != id);
        newRoadMapExams = newRoadMapExams.map((item, index) => ({ ...item, index: index + 1 }));
        setRoadMapExams(newRoadMapExams);
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
        if (sortConfig.length === 0) return [...roadMapExams];

        return [...roadMapExams].sort((a, b) => {
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
        getRoadMapExams();
    }, [])

    useEffect(() => {
        setSortedData(sortedDataFunc());
    }, [roadMapExams, sortConfig])

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

    const handleReloadExam = () => {
        getRoadMapExams();
    }

    return (
        <div className='rdi__wrapper px-[20px] min-h-[500px]'>
            <div className='flex items-center justify-between'>
                <div className='rdi__title'>list of Exams</div>
                <div className="flex items-center">
                    <div className="flex items-center">
                        <div className='mpt__header-item--search-icon'>
                            <img src={IMG_URL_BASE + "search_icon.svg"} className='w-[30px] p-[6px]' />
                        </div>
                        <input placeholder='Search ...' className='mpt__header-item--search !mr-0' value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                    </div>
                    {isTeacher == false &&
                        <button className='cmp__add-class--btn ml-[20px]' onClick={(e) => setIsShowBoard(!isShowBoard)}>
                            {
                                !isShowBoard ?
                                    "Add Exam"
                                    :
                                    "Hide Board"
                            }
                        </button>
                    }
                </div>
            </div>

            {isShowBoard && <RoadmapDetailAddBoard roadmapId={roadmapId} isShow={isShowBoard} onShow={setIsShowBoard} onReloadExam={handleReloadExam} />}

            <div className="clb__tbl__wrapper mt-[20px]">
                <div className="mpt__header flex w-full">
                    <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("index", event)}>No</div>
                    <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("name", event)}>Name</div>
                    <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("time_Minutes", event)}>Time</div>
                    <div className="mpt__header-item w-1/6" onClick={(event) => handleSort("point", event)}>Point</div>
                    <div className="mpt__header-item w-1/6" onClick={(event) => handleSort("completed_Num", event)}>Completed</div>
                    <div className="mpt__header-item w-1/12"></div>
                </div>

                <div className='mpt__body min-h-[390px] mt-[10px]'>
                    {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                        return (
                            <RoadMapExamItem
                                roadMapInfo={item}
                                key={index}
                                index={item.index}
                                onReloadExam={handleReloadExam}
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
    )
}

function RoadMapExamItem({ index, roadMapInfo, onReloadExam, isTeacher = false }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isShowDetail, setIsShowDetail] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const timeMask = [/\d/, /\d/, ':', /\d/, /\d/, ':', /\d/, /\d/];
    const inputTimeRef = useRef(null);
    const inputNameRef = useRef(null);
    const inputPointRef = useRef(null);

    const minutesToTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = Math.floor(minutes % 60);
        const secs = Math.round((minutes % 1) * 60);
        const format = (num) => String(num).padStart(2, '0');
        return `${format(hours)}:${format(mins)}:${format(secs)}`;
    }

    const timeToMinutes = (time) => {
        const [hours, mins, secs] = time.split(':').map(Number);
        return hours * 60 + mins + secs / 60;
    }

    const timeToSeconds = (time) => {
        let [hours, minutes, seconds] = time.split(':').map(Number);
        return Math.round(hours * 3600 + minutes * 60 + seconds);
    }

    const isValidTime = (time) => {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return (
            hours >= 0 && hours <= 23 &&
            minutes >= 0 && minutes <= 59 &&
            seconds >= 0 && seconds <= 59
        );
    };

    const handleChangePoint = (event) => {
        if (inputPointRef.current) {
            inputPointRef.current.value = event.target.value.replace(/[^0-9]/g, '');
        }
    }

    const handleEditExam = async (event) => {
        event.preventDefault();
        if (!isEditing) {
            setIsEditing(!isEditing)
        }
        else {
            if (inputNameRef.current && (inputNameRef.current.value == "" || inputNameRef.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Title is required",
                    duration: 4000
                })

                inputNameRef.current.classList.toggle("cabf__input--error");
                inputNameRef.current.focus();

                setTimeout(() => {
                    inputNameRef.current.classList.toggle("cabf__input--error");
                }, 2000);

                return;
            }

            let inputTime = inputTimeRef.current.inputElement;
            if (inputTime && (inputTime.value == "" || inputTime.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Time is required",
                    duration: 4000
                })

                inputTime.classList.toggle("cabf__input--error");
                inputTime.focus();

                setTimeout(() => {
                    inputTime.classList.toggle("cabf__input--error");
                }, 2000);

                return;
            }
            else {
                let isValid = isValidTime(inputTime.value);
                let seconds = timeToSeconds(inputTime.value);
                if (isValid == false || seconds == 0) {
                    toast({
                        type: "error",
                        title: "ERROR",
                        message: "Time is invalid",
                        duration: 4000
                    })

                    inputTime.classList.toggle("cabf__input--error");
                    inputTime.focus();

                    setTimeout(() => {
                        inputTime.classList.toggle("cabf__input--error");
                    }, 2000);
                    return;
                }
            }

            let formData = new FormData();
            formData.append("Name", inputNameRef.current.value);
            formData.append("TimeMinutes", timeToMinutes(inputTime.value));
            formData.append("Point", roadMapInfo.point);
            formData.append("RoadMapId", roadMapInfo.roadMapId);

            const response = await appClient.put(`api/RoadMapExams/${roadMapInfo.id}`, formData);
            const dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Success",
                    message: "Update infomation successfully",
                    duration: 4000
                });

                setIsEditing(!isEditing);
            }

        }
    }

    const handleDeleteExam = async (event) => {
        event.preventDefault();

        try {
            var confirmAnswer = confirm("Do you want to delete this exam?");
            if (confirmAnswer == false) return;

            setIsLoading(true);
            const response = await appClient.delete(`api/RoadMapExams/${roadMapInfo.id}`);
            const dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Success",
                    message: "Delete exam successfully",
                    duration: 4000
                });

                onReloadExam();
            }
            setIsLoading(false);
        }
        catch {
            setIsLoading(false);
        }
    }

    const handleViewQuestion = (event) => {
        setIsShowDetail(true);
    }

    useEffect(() => {
        inputTimeRef.current.inputElement.value = minutesToTime(roadMapInfo?.time_Minutes);
        inputNameRef.current.value = roadMapInfo.name;
        inputPointRef.current.value = roadMapInfo.point;
    }, [roadMapInfo])

    return (
        <>
            <div className={`mpt__row flex items-center mb-[10px]`} onClick={handleViewQuestion}>
                <div className="mpt__row-item w-1/12 cci__row-item"># {index}</div>
                <div className="mpt__row-item w-1/4 flex cci__row-item" onClick={(e) => {
                    if (isEditing) e.stopPropagation();
                }}>
                    <input
                        className={`rmei__input ${isEditing ? "bg-white border !cursor-auto" : "bg-transparent"}`}
                        name='Name'
                        ref={inputNameRef}
                        readOnly={!isEditing}
                    />
                </div>
                <div className="mpt__row-item w-1/4 flex cci__row-item" onClick={(e) => {
                    if (isEditing) e.stopPropagation();
                }}>
                    <MaskedInput
                        mask={timeMask}
                        placeholder="00:00:00"
                        defaultValue={"00:00:00"}
                        className={`rmei__input ${isEditing ? "bg-white border !cursor-auto" : "bg-transparent"}`}
                        ref={inputTimeRef}
                        readOnly={!isEditing}
                    />
                </div>
                <div className="mpt__row-item w-1/6 flex cci__row-item">
                    <input
                        className={`rmei__input bg-transparent`}
                        name='Point'
                        ref={inputPointRef}
                        readOnly
                        onChange={handleChangePoint}
                    />
                </div>
                <div className="mpt__row-item w-1/6 cci__row-item">{roadMapInfo.completed_Num}</div>
                <div className="mpt__row-item w-1/12 flex cci__row-item" onClick={(e) => e.stopPropagation()}>
                    {
                        isTeacher == false
                        &&
                        <>
                            <button className='mpt__item--btn' onClick={handleEditExam}>
                                {
                                    !isEditing ?
                                        <img src={IMG_URL_BASE + "edit-icon.svg"} className='w-[25px] p-[3px]' />
                                        :
                                        <img src={IMG_URL_BASE + "check_thin_icon.svg"} className='w-[25px]' />
                                }
                            </button>
                            <button className='mpt__item--btn' onClick={handleDeleteExam}>
                                <img src={IMG_URL_BASE + "close.svg"} className='w-[25px] p-[3px]' />
                            </button>
                        </>
                    }
                </div>
            </div>

            {isLoading && <LoaderPage />}
            {isShowDetail && <RoadmapItemDetailView isTeacher={isTeacher} roadmapInfo={roadMapInfo} onShow={setIsShowDetail} onReloadRoadMap={onReloadExam} />}
        </>
    )
}

function RoadmapItemDetailView({ roadmapInfo, onShow, isTeacher, onReloadRoadMap }) {
    const [isShowAddBoard, setIsShowAddBoard] = useState(false);
    const [queInfos, setQueInfos] = useState([]);
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowPerPage = 5;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(queInfos.length / rowPerPage);

    const getQueInfos = async () => {
        try {
            const response = await appClient.get(`api/RandomQues/road-map-exams/${roadmapInfo.id}/default`);
            const dataRes = response.data;
            if (dataRes.success) {
                setQueInfos(dataRes.message.map((item, index) => ({ ...item, index: index + 1 })))
            }
        }
        catch {

        }
    }

    const handleReloadRoadmap = () => {
        onReloadRoadMap();
        getQueInfos();
    }

    useEffect(() => {
        getQueInfos();
    }, [roadmapInfo])

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

    const handleDeleteQues = (id) => {
        let newQueInfos = queInfos.filter(c => c.quesId != id);
        newQueInfos = newQueInfos.map((item, index) => ({ ...item, index: index + 1 }));
        setQueInfos(newQueInfos);
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
        if (sortConfig.length === 0) return [...queInfos];

        return [...queInfos].sort((a, b) => {
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
        setSortedData(sortedDataFunc());
    }, [queInfos, sortConfig])


    return (
        <>
            <div className='fixed top-0 left-0 z-[1000] ridv__wrapper w-full h-full flex items-center justify-center' onClick={(e) => onShow(false)} >
                <div className='w-[700px] h-[510px] bg-white rounded-[10px] shadow-md p-[20px]' onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between">
                        <div className='ridv__title'>{roadmapInfo.name}</div>
                        <button className='ridv__btn-add' onClick={(e) => setIsShowAddBoard(true)}>
                            Add
                        </button>
                    </div>

                    <div className="clb__tbl__wrapper mt-[20px] ">
                        <div className="mpt__header flex w-full items-center">
                            <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("noNum", event)}>Question</div>
                            <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("courseId", event)}>Type</div>
                            <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("courseId", event)}>Level</div>
                            <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("description", event)}></div>
                        </div>

                        <div className='mpt__body min-h-[320px] overflow-hidden mt-[10px]'>
                            {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                                return (
                                    <RoadMapItemDetailRow key={index} index={item.index} roadMapId={roadmapInfo.id} quesInfo={item} onDelete={handleDeleteQues} isTeacher={isTeacher} />
                                )
                            })}
                        </div>

                        <div className='flex justify-end items-center'>
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

            {isShowAddBoard && <RoadmapAddMoreBoard onShow={setIsShowAddBoard} roadmapInfo={roadmapInfo} onReloadItemDetail={handleReloadRoadmap} />}
        </>
    )
}

function RoadmapAddMoreBoard({ isShow, onShow, roadmapInfo, onReloadItemDetail }) {
    const roadmapSelectedModeRef = useRef(null);
    const [queIds, setQueIds] = useState([]);
    const [partTypes, setPartTypes] = useState([]);

    const getFullQuesId = async () => {
        try {
            const response = await appClient.get(`api/QuesToeic/roadmaps/${roadmapInfo.id}/other-ques`);
            const data = response.data;
            if (data.success) {
                setQueIds(data.message);
            }
        }
        catch {

        }
    }

    const getPartTypes = async () => {
        try {
            const response = await appClient.get("api/homeques/part-types");
            const data = response.data;
            if (data.success) {
                setPartTypes(data.message);
                setselec
            }
        }
        catch {

        }
    }

    const handleSubmitAddMore = async (event) => {
        event.preventDefault();

        let { selectedQues, expectedTime, time } = roadmapSelectedModeRef.current.getSelectedQues();
        let inputTimeRef = roadmapSelectedModeRef.current.inputTimeRef;
        let inputExpectedTimeRef = roadmapSelectedModeRef.current.inputExpectedTimeRef;
        const isValidTime = roadmapSelectedModeRef.current.isValidTime;
        const timeToSeconds = roadmapSelectedModeRef.current.timeToSeconds;
        const secondsToTime = roadmapSelectedModeRef.current.secondsToTime;

        if (inputTimeRef && (inputTimeRef.value == "" || inputTimeRef.value == null)) {
            toast({
                type: "error",
                title: "ERROR",
                message: "Time is required",
                duration: 4000
            })

            inputTimeRef.classList.toggle("cabf__input--error");
            inputTimeRef.focus();
            inputTimeRef.value = secondsToTime(roadmapInfo.time_Minutes * 60);

            setTimeout(() => {
                inputTimeRef.classList.toggle("cabf__input--error");
            }, 2000);

            return;
        }
        else {
            let isValid = isValidTime(inputTimeRef.value);
            let seconds = timeToSeconds(inputTimeRef.value);
            if (isValid == false || seconds == 0) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Time is invalid",
                    duration: 4000
                })

                inputTimeRef.classList.toggle("cabf__input--error");
                inputTimeRef.focus();
                inputTimeRef.value = secondsToTime(roadmapInfo.time_Minutes * 60);

                setTimeout(() => {
                    inputTimeRef.classList.toggle("cabf__input--error");
                }, 2000);
                return;
            }

            if (timeToSeconds(inputExpectedTimeRef.value) > seconds) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Time must be greater than expected time",
                    duration: 4000
                })

                inputTimeRef.classList.toggle("cabf__input--error");
                inputTimeRef.focus();
                inputTimeRef.value = secondsToTime(roadmapInfo.time_Minutes * 60);

                setTimeout(() => {
                    inputTimeRef.classList.toggle("cabf__input--error");
                }, 2000);
                return;
            }
        }
        try {
            const formRoadMapData = new FormData();

            let indexNum = 0;
            Object.keys(selectedQues).forEach((key, index) => {
                selectedQues[key].forEach((item, indexQue) => {
                    formRoadMapData.append(`models[${indexNum}].RoadMapExamId`, roadmapInfo.id);
                    formRoadMapData.append(`models[${indexNum}].QuesToeicId`, item);
                    indexNum++;
                })
            })

            let response = await appClient.post(`api/RandomQues/road-map-exams/list`, formRoadMapData);
            let dataRes = response.data;
            if (dataRes.success) {
                let timeMinutes = (timeToSeconds(inputTimeRef.value) / 60).toFixed(2);
                response = await appClient.patch(`api/RoadMapExams/${roadmapInfo.id}/time?timeMinutes=${timeMinutes}`);
                dataRes = response.data;

                if (dataRes.success) {
                    toast({
                        type: "success",
                        title: "Success",
                        message: "Update assignment successfully",
                        duration: 4000
                    });
                }

                onReloadItemDetail();
                onShow(false);
            }
        }
        catch {
            inputTimeRef.value = secondsToTime(roadmapInfo.time_Minutes * 60);
        }
    }

    useEffect(() => {
        getPartTypes();
        getFullQuesId();

    }, [])
    return (
        <div className='fixed top-0 left-0 z-[1001] ridv__wrapper w-full h-full flex items-center justify-center' onClick={(e) => onShow(false)} >
            <div className='w-[1000px] h-[600px] ramb__wrapper bg-white rounded-[10px] shadow-md p-[20px]' onClick={(e) => e.stopPropagation()} >
                <form onSubmit={handleSubmitAddMore} className='overflow-visible'>
                    <RoadmapWithSelectMode partTypes={partTypes} queIds={queIds} timeMinutes={roadmapInfo.time_Minutes} roadmapId={roadmapInfo.id} ref={roadmapSelectedModeRef} />
                </form>
            </div>
        </div>
    )
}

function RoadMapItemDetailRow({ quesInfo, roadMapId, index, onDelete, isTeacher }) {
    const [isShowQues, setIsShowQues] = useState(false);
    let level = quesInfo.level;
    let levelName = "";
    if (level == 1) {
        levelName = "Normal"
    }
    if (level == 2) {
        levelName = "Intermediate"
    }
    if (level == 3) {
        levelName = "Hard"
    }
    if (level == 4) {
        levelName = "Very hard"
    }

    const handleDeleteQuestion = async (event) => {
        event.preventDefault();

        try {
            const confirmAnswer = confirm("Do you want to delete ?");
            if (confirmAnswer) {
                var response = await appClient.delete(`api/RandomQues/road-map-exams/${roadMapId}?quesId=${quesInfo.quesId}`);
                if (response.data.success) {
                    toast({
                        type: "success",
                        title: "Success",
                        message: "Delete question successfully",
                        duration: 4000
                    });

                    onDelete(quesInfo.quesId);
                }
            }
        }
        catch {

        }
    }

    const handleClickViewAnswerInfor = (event) => {
        setIsShowQues(true);
    }

    useEffect(() => {
        setIsShowQues(false);
    }, [quesInfo])
    return (
        <>
            <div className='mpt__row flex items-center mb-[10px]' onClick={handleClickViewAnswerInfor}>
                <div className="mpt__row-item w-1/4 ">Question {index}</div>
                <div className="mpt__row-item w-1/4 ">{quesInfo.part_Name}</div>
                <div className="mpt__row-item w-1/4 ">{levelName}</div>
                <div className="mpt__row-item w-1/4 ">
                    {
                        isTeacher == false &&
                        <div className='flex items-center justify-end' onClick={(e) => e.stopPropagation()}>
                            <button className='adlq__btn-func w-[80px] delete' onClick={handleDeleteQuestion}>Remove</button>
                        </div>
                    }
                </div>
            </div>

            {isShowQues &&
                <>
                    {quesInfo.isGroup ?
                        <QuesGroup question={quesInfo} className={"!fixed !top-0 !left-0"} onShow={setIsShowQues} isShowBtn={true} />
                        :
                        <QuesNoGroup question={quesInfo} className={"!fixed !top-0 !left-0"} onShow={setIsShowQues} isShowBtn={true} />
                    }
                </>
            }
        </>
    )
}

function RoadmapDetailAddBoard({ isShow, onShow, onReloadExam, roadmapId }) {
    const [selectedMode, setSelectedMode] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [queIds, setQueIds] = useState([]);
    const [partTypes, setPartTypes] = useState([]);
    const [selectedType, setSelectedType] = useState(null);
    const roadmapSelectedModeRef = useRef(null);
    const queRandomRef = useRef(null);

    const inputNameRef = useRef();

    const getPartTypes = async () => {
        try {
            const response = await appClient.get("api/homeques/part-types");
            const data = response.data;
            if (data.success) {
                setPartTypes(data.message);
                setselec
            }
        }
        catch {

        }
    }

    const getFullQuesId = async () => {
        try {
            const response = await appClient.get("api/QuesToeic/parts/ques-id");
            const data = response.data;
            if (data.success) {
                setQueIds(data.message);
            }
        }
        catch {

        }
    }

    const timeToMinutes = (time) => {
        const [hours, mins, secs] = time.split(':').map(Number);
        return hours * 60 + mins + secs / 60;
    }

    useEffect(() => {
        getPartTypes();
        getFullQuesId();
    }, [])

    const handleSubmitForm = async (event) => {
        event.preventDefault();

        try {
            if (inputNameRef.current && (inputNameRef.current.value == "" || inputNameRef.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Name is required",
                    duration: 4000
                })

                inputNameRef.current.classList.toggle("cabf__input--error");
                inputNameRef.current.focus();

                setTimeout(() => {
                    inputNameRef.current.classList.toggle("cabf__input--error");
                }, 2000);

                return;
            }

            setIsLoading(true);

            const formData = new FormData();
            formData.append("Name", inputNameRef.current.value);
            formData.append("RoadMapId", roadmapId);

            if (selectedMode == 0) {
                let { selectedQues, expectedTime, time } = roadmapSelectedModeRef.current.getSelectedQues();
                let inputTimeRef = roadmapSelectedModeRef.current.inputTimeRef;
                let inputExpectedTimeRef = roadmapSelectedModeRef.current.inputExpectedTimeRef;
                const isValidTime = roadmapSelectedModeRef.current.isValidTime;
                const timeToSeconds = roadmapSelectedModeRef.current.timeToSeconds;

                if (inputTimeRef && (inputTimeRef.value == "" || inputTimeRef.value == null)) {
                    toast({
                        type: "error",
                        title: "ERROR",
                        message: "Time is required",
                        duration: 4000
                    })

                    inputTimeRef.classList.toggle("cabf__input--error");
                    inputTimeRef.focus();
                    inputTimeRef.value = assignmentInfo.time;

                    setTimeout(() => {
                        inputTimeRef.classList.toggle("cabf__input--error");
                    }, 2000);

                    setIsLoading(false);
                    return;
                }
                else {
                    let isValid = isValidTime(inputTimeRef.value);
                    let seconds = timeToSeconds(inputTimeRef.value);
                    if (isValid == false || seconds == 0) {
                        toast({
                            type: "error",
                            title: "ERROR",
                            message: "Time is invalid",
                            duration: 4000
                        })

                        inputTimeRef.classList.toggle("cabf__input--error");
                        inputTimeRef.focus();

                        setTimeout(() => {
                            inputTimeRef.classList.toggle("cabf__input--error");
                        }, 2000);
                        setIsLoading(false);
                        return;
                    }

                    if (timeToSeconds(inputExpectedTimeRef.value) > seconds) {
                        toast({
                            type: "error",
                            title: "ERROR",
                            message: "Time must be greater than expected time",
                            duration: 4000
                        })

                        inputTimeRef.classList.toggle("cabf__input--error");
                        inputTimeRef.focus();

                        setTimeout(() => {
                            inputTimeRef.classList.toggle("cabf__input--error");
                        }, 2000);

                        setIsLoading(false);
                        return;
                    }
                }

                formData.append("TimeMinutes", timeToMinutes(inputTimeRef.value));

                let response = await appClient.post("api/RoadMapExams", formData);
                let dataRes = response.data;

                const roadmapExamId = dataRes.message;

                let indexNum = 0;
                const formDataAssignQues = new FormData();

                Object.keys(selectedQues).forEach((key, index) => {
                    selectedQues[key].forEach((item, indexQue) => {
                        formDataAssignQues.append(`models[${indexNum}].RoadMapExamId`, roadmapExamId);
                        formDataAssignQues.append(`models[${indexNum}].QuesToeicId`, item);
                        indexNum++;
                    })
                })

                response = await appClient.post(`api/RandomQues/road-map-exams/list`, formDataAssignQues);
                dataRes = response.data;
                if (dataRes.success) {
                    onShow(false);
                    onReloadExam();

                    toast({
                        type: "success",
                        title: "Success",
                        message: "Create exam successfully",
                        duration: 4000
                    });
                }
            }

            if (selectedMode == 1) {
                formData.append("TimeMinutes", 0);

                let response = await appClient.post("api/RoadMapExams", formData);
                let dataRes = response.data;

                const examId = dataRes.message;
                const quesDataForm = queRandomRef.current.getFormData();

                response = await appClient.post(`api/RandomQues/road-map-exams/${examId}/random/list`, quesDataForm);
                dataRes = response.data;
                if (dataRes.success) {
                    onShow(false);
                    onReloadExam();

                    toast({
                        type: "success",
                        title: "Success",
                        message: "Create exam successfully",
                        duration: 4000
                    });
                }
            }

            setIsLoading(false);
        }
        catch (err) {
            console.log(err);
            setIsLoading(false);
        }
    }


    return (
        <>
            <form onSubmit={handleSubmitForm} className={`w-full mt-[20px] mb-[20px] cab__wrapper p-[20px] border rounded-[10px] overflow-visible ${isShow ? "block" : "hidden"} p-[10px]`}>
                <div className='flex items-center'>
                    <div className='flex items-center overflow-visible flex-1'>
                        <div className='ceab__title-text text-right mr-[10px]'>Name</div>
                        <input className='ceab__input' name='Name' ref={inputNameRef} />
                        <input className='hidden' name='RoadMapId' value={roadmapId} readOnly />
                    </div>

                    <div className='flex items-center justify-around flex-1'>
                        <div className='ceab__title-text text-right mr-[10px]'>Mode</div>

                        <div className='flex-1 flex justify-around'>
                            <div className='flex items-center'>
                                <input type='radio' name='ques-type' id='select' checked={selectedMode == 0} onChange={(e) => setSelectedMode(0)} />
                                <label className='aab__title-lbl' htmlFor='select'>Select</label>
                            </div>

                            <div className='flex items-center'>
                                <input type='radio' name='ques-type' id='random' checked={selectedMode == 1} onChange={(e) => setSelectedMode(1)} />
                                <label className='aab__title-lbl' htmlFor='random'>Random</label>
                            </div>
                        </div>
                    </div>
                </div>

                {selectedMode == 0 && <RoadmapWithSelectMode partTypes={partTypes} queIds={queIds} ref={roadmapSelectedModeRef} />}
                {selectedMode == 1 &&
                    <div className='mt-[20px]'>
                        <QuestionToeicStandard ref={queRandomRef} />
                        <div className="flex justify-end mt-[20px]">
                            <button type='submit' className='qi__btn-func !w-[200px]'>Submit</button>
                        </div>
                    </div>
                }
            </form>

            {isLoading && <LoaderPage />}
        </>
    )
}

const RoadmapWithSelectMode = forwardRef(({ partTypes, queIds, timeMinutes, roadmapId }, ref) => {
    const [selectedQues, setSelectedQues] = useState(() => {
        return Array.from({ length: 7 }).reduce((acc, _, i) => {
            acc[i + 1] = [];
            return acc;
        }, {});
    });

    const [previousQues, setPreviousQues] = useState([]);
    const [renderQueIds, setRenderQueIds] = useState([]);
    const [selectedPart, setSelectedPart] = useState(null);
    const [indexPart, setIndexPart] = useState(0);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [indexQuestion, setIndexQuesion] = useState(-1);
    const [isSelected, setIsSelected] = useState(false);
    const quesToeicInfoRef = useRef(null);

    const timeMask = [/\d/, /\d/, ':', /\d/, /\d/, ':', /\d/, /\d/];
    const inputTimeRef = useRef(null);
    const inputExpectedTimeRef = useRef(null);

    const timeToSeconds = (time) => {
        let [hours, minutes, seconds] = time.split(':').map(Number);
        return Math.round(hours * 3600 + minutes * 60 + seconds);
    }

    const secondsToTime = (totalSeconds) => {
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = totalSeconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    const isValidTime = (time) => {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return (
            hours >= 0 && hours <= 23 &&
            minutes >= 0 && minutes <= 59 &&
            seconds >= 0 && seconds <= 59
        );
    };

    const getPreviousQues = async () => {
        try {
            const response = await appClient.get(`api/RandomQues/road-map-exams/${roadmapId}/num`);
            const dataRes = response.data;

            if (dataRes.success) {
                const result = dataRes.message;
                console.log(dataRes.message);
                setPreviousQues(Object.values(result));
            }
        }
        catch {

        }
    }

    const handleSelectedPart = (item, index) => {
        setSelectedPart(item);
        setIndexPart(index);
        setIndexQuesion(-1);
        setSelectedQuestion(null);
    }

    const handleSelectedQuestion = (item, index) => {
        setIndexQuesion(index);
        setSelectedQuestion(item);
    }

    useEffect(() => {
        if (timeMinutes) {
            inputTimeRef.current.inputElement.value = secondsToTime(Math.round(timeMinutes * 60));
            inputExpectedTimeRef.current.value = secondsToTime(Math.round(timeMinutes * 60));
        }

        if (roadmapId) {
            getPreviousQues();
        }
    }, [])

    useEffect(() => {
        setIndexPart(0);
        setSelectedPart(partTypes[0]);
    }, [partTypes])

    useEffect(() => {
        if (selectedPart) {
            var renderQues = queIds.filter(q => q.part == selectedPart.value).map((item, index) => ({ key: item.quesId, value: item.quesId }));
            setRenderQueIds(renderQues);
        }
    }, [selectedPart, queIds])

    useEffect(() => {
        if (selectedQuestion) {
            setIsSelected(selectedQues[selectedPart.value].some(i => i == selectedQuestion.key));
        }
        else {
            setIsSelected(false);
        }
    }, [selectedQuestion, selectedQues])

    const handleDeleteQues = (event) => {
        event.preventDefault();
        setSelectedQues(prev => {
            if (selectedQuestion != null) {
                let type = selectedPart.value;
                const length = prev[type] ? prev[type].length : 0;

                if (prev[type]) {
                    prev[type] = prev[type].filter(i => i !== selectedQuestion.key);
                }

                const lengthAfter = prev[type] ? prev[type].length : 0;

                if (length !== lengthAfter) {
                    const questionInfo = quesToeicInfoRef.current.getQuestionInfo();

                    questionInfo.then(data => {
                        if (inputExpectedTimeRef.current) {
                            const inputValue = inputExpectedTimeRef.current.value;
                            let totalTime = timeToSeconds(inputValue == "" ? "00:00:00" : inputValue) - timeToSeconds(data?.time);

                            inputExpectedTimeRef.current.value = secondsToTime(totalTime < 0 ? 0 : totalTime);
                        }
                    })
                }
            }


            return { ...prev }
        });
    }

    const handleAddQues = (event) => {
        setSelectedQues(prev => {
            if (selectedQuestion != null) {
                let type = selectedPart.value
                const length = prev[type] ? prev[type].length : 0;
                const preQuesNum = previousQues[type - 1] ?? 0;

                if (prev[type]) {
                    prev[type] = prev[type].filter(i => i !== selectedQuestion.key);
                    let isValid = true;
                    if (type == 1 && prev[type].length + preQuesNum >= 6) {
                        isValid = false;
                    }
                    if (type == 2 && prev[type].length + preQuesNum >= 25) {
                        isValid = false;
                    }
                    if (type == 3 && prev[type].length + preQuesNum >= 13) {
                        isValid = false;
                    }
                    if (type == 4 && prev[type].length + preQuesNum >= 10) {
                        isValid = false;
                    }
                    if (type == 5 && prev[type].length + preQuesNum >= 30) {
                        isValid = false;
                    }
                    if (type == 6 && prev[type].length + preQuesNum >= 4) {
                        isValid = false;
                    }
                    if (type == 7 && prev[type].length + preQuesNum >= 15) {
                        isValid = false;
                    }

                    if (isValid == false) {
                        toast({
                            type: "error",
                            title: "Success",
                            message: `Part ${type} is full and cannot be added.`,
                            duration: 4000
                        })

                        return prev;
                    }

                    prev[type].push(selectedQuestion.key);
                }
                else {
                    prev[type] = [selectedQuestion.key];
                }

                const lengthAfter = prev[type] ? prev[type].length : 0;

                if (length !== lengthAfter) {
                    const questionInfo = quesToeicInfoRef.current.getQuestionInfo();

                    questionInfo.then(data => {
                        if (inputExpectedTimeRef.current) {
                            const inputValue = inputExpectedTimeRef.current.value;
                            const totalTime = timeToSeconds(inputValue == "" ? "00:00:00" : inputValue) + timeToSeconds(data?.time);
                            inputExpectedTimeRef.current.value = secondsToTime(totalTime);
                        }
                    })
                }
            }
            return { ...prev }
        })
    }

    useImperativeHandle((ref), () => ({
        inputTimeRef: inputTimeRef.current.inputElement,
        inputExpectedTimeRef: inputExpectedTimeRef.current,
        isValidTime,
        timeToSeconds,
        secondsToTime,
        getSelectedQues: () => {
            return {
                selectedQues: selectedQues,
                expectedTime: inputExpectedTimeRef.current.value,
                time: inputTimeRef.current.inputElement.value
            };
        }
    }))

    return (
        <>
            <div className='flex items-center mt-[20px]'>
                <div className="flex items-center flex-1">
                    <div className='ceab__title-text text-right mr-[10px]'>Expected Time</div>
                    <input
                        type='text'
                        className="lbh__input"
                        readOnly
                        ref={inputExpectedTimeRef}
                    />
                </div>
                <div className="flex items-center flex-1">
                    <div className='ceab__title-text text-right mr-[10px]'>Time</div>
                    <MaskedInput
                        name='Time'
                        mask={timeMask}
                        placeholder="00:00:00"
                        defaultValue={"00:00:00"}
                        className="lbh__input"
                        ref={inputTimeRef}
                    />
                </div>
            </div>

            <div className='flex items-center overflow-visible mt-[20px]'>

                <div className='flex items-center overflow-visible flex-1'>
                    <div className='ceab__title-text text-right mr-[10px]'>Part Types</div>
                    <DropDownList
                        data={partTypes}
                        defaultIndex={indexPart}
                        className={"border !rounded-[20px] border-[#cccccc]"}
                        tblClassName={"!h-[200px]"}
                        onSelectedItem={handleSelectedPart}
                    />
                </div>

                <div className='flex items-center overflow-visible flex-1'>
                    <div className='ceab__title-text text-right mr-[10px]'>Question</div>
                    <DropDownList
                        data={renderQueIds}
                        defaultIndex={indexQuestion}
                        onSelectedItem={handleSelectedQuestion}
                        className={"border !rounded-[20px] border-[#cccccc]"}
                        tblClassName={"!h-[200px]"}
                    />
                </div>
            </div>

            <div className='flex justify-between border mt-[20px]'>
                {partTypes.map((item, index) => {
                    var preQuesNum = previousQues[index] ?? 0;
                    return (
                        <div className='rm__part--title flex' key={index}>
                            <div className='font-bold'>{item.key}:</div>
                            <div className='ml-[10px]'>{selectedQues[item.value].length + preQuesNum}</div>
                        </div>
                    )
                })}
            </div>

            <div className='flex justify-between mt-[20px] mb-[20px]'>
                <div className='flex justify-end '>
                    <div className='qi__btn-func delete' onClick={(event) => handleDeleteQues(event)}>Undo</div>
                    <div className='qi__btn-func' onClick={(event) => handleAddQues(event)}>Add</div>
                </div>

                <div>
                    {
                        isSelected == true &&
                        <div className='qi__selected--text'>
                            Selected
                        </div>
                    }
                </div>

                <div>
                    <button className='qi__btn-func !w-[200px]' type='submit'>Submit</button>
                </div>
            </div>

            {selectedQuestion != null && <QuesToeicInfo quesId={selectedQuestion.value} ref={quesToeicInfoRef} />}
        </>
    )
}
)

export const QuesToeicInfo = forwardRef((props, ref) => {
    const [questionInfo, setQuestionInfo] = useState({});

    const getQuestionInfo = async () => {
        try {
            const response = await appClient.get(`api/questoeic/${props.quesId}`);
            const data = response.data;
            if (data.success) {
                setQuestionInfo(data.message);

                return data.message;
            }

            return null;
        }
        catch {
            return null;
        }
    }

    useEffect(() => {
        getQuestionInfo();
    }, [props.quesId])

    useImperativeHandle(ref, () => ({
        getQuestionInfo
    }))

    return (
        <>
            {questionInfo != null && questionInfo.isGroup == true && <QuesGroup question={questionInfo} onShow={setQuestionInfo} />}
            {questionInfo != null && questionInfo.isGroup == false && <QuesNoGroup question={questionInfo} onShow={setQuestionInfo} />}
        </>
    )
})

export function QuesGroup({ question, className, onShow, isShowBtn = false }) {
    const audioRef = useRef();
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.load();
        }
    }, [question])

    return (
        <div className={`w-full flex h-full justify-center items-center ceq__wrapper ${className}`} onClick={(e) => onShow(false)}>
            <div className='w-full h-full p-[20px] bg-white flex flex-col' onClick={(e) => e.stopPropagation()}>
                <div className='grid grid-cols-2 gap-[20px] flex-1'>
                    <div>
                        {question.image_1 !== "" && <img src={APP_URL + question.image_1} className='w-[85%] mx-auto' />}
                        {question.image_2 !== "" && <img src={APP_URL + question.image_2} className='w-[85%] mx-auto' />}
                        {question.image_3 !== "" && <img src={APP_URL + question.image_3} className='w-[85%] mx-auto' />}
                    </div>

                    <div >
                        {question.subQues.map((sub, index) => {
                            return (
                                <AnswerOptions
                                    key={index}
                                    part={question.part}
                                    num={4}
                                    quesInfo={sub}
                                    isGroup={question.isGroup}
                                />
                            )
                        })}
                    </div>

                </div>

                <div className='flex justify-between items-center h-[50px] mt-[10px]'>
                    <div>
                        {
                            question.audio &&
                            <>
                                <div className='flex justify-center col-span-2'>
                                    <audio controls ref={audioRef} className='h-[50px]'>
                                        <source src={APP_URL + question.audio} type="audio/mpeg" />
                                    </audio>
                                </div>
                            </>
                        }
                    </div>


                    {
                        isShowBtn == true &&
                        <div>
                            <button className='qit__btn-func h-[50px]' onClick={(e) => onShow(false)}>
                                Close
                            </button>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}

export function QuesNoGroup({ question, onShow, isShowBtn = false, className }) {
    const audioRef = useRef(null);
    const hasNoImage = question.image_1 === "" && question.image_2 === "" && question.image_3 === "";

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.load()
        }
    }, [question]);

    return (
        <div className={`w-full flex justify-center items-center h-full ceq__wrapper ${className}`} onClick={(e) => onShow(false)}>
            <div className='w-full h-full  bg-white flex flex-col ' onClick={(e) => e.stopPropagation()}>
                <div className='grid grid-cols-2 gap-[20px] flex-1 px-[20px]'>
                    {
                        !hasNoImage &&
                        <div>
                            {question.image_1 !== "" && <img src={APP_URL + question.image_1} className='w-full object-contain' />}
                            {question.image_2 !== "" && <img src={APP_URL + question.image_2} className='w-full object-contain' />}
                            {question.image_3 !== "" && <img src={APP_URL + question.image_3} className='w-full object-contain' />}
                        </div>
                    }
                    <div className={`bg-white p-[20px] ${hasNoImage && "col-span-2"}`}>
                        {question.subQues.map((sub, index) => {
                            return (
                                <AnswerOptions
                                    key={index}
                                    part={question.part}
                                    num={question.part == 2 ? 3 : 4}
                                    quesInfo={sub}
                                    isGroup={question.isGroup}
                                />
                            )
                        })}
                    </div>

                </div>

                <div className='flex justify-between items-center min-h-[50px] px-[20px]'>
                    <div>
                        {
                            question.audio &&
                            <>
                                <div className='flex justify-center col-span-2'>
                                    <audio controls preload='auto' ref={audioRef} className='h-[50px]'>
                                        <source src={APP_URL + question.audio} type="audio/mpeg" />
                                    </audio>
                                </div>
                            </>
                        }
                    </div>

                    {
                        isShowBtn == true &&
                        <div>
                            <button className='qit__btn-func h-[50px]' onClick={(e) => onShow(false)}>
                                Close
                            </button>
                        </div>
                    }
                </div>
            </div>
        </div>
    )
}


export default RoadmapDetailInfo