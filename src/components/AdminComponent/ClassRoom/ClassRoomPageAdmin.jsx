import React, { useEffect, useRef, useState } from 'react'
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE } from '~/GlobalConstant.js';
import toast from '@/helper/Toast';
import LoaderPage from '../../LoaderComponent/LoaderPage';
import { use } from 'react';

function ClassRoomPageAdmin() {
    const [classRooms, setClassRooms] = useState([]);
    const [isShowClassroomBoard, setIsShowClassroomBoard] = useState(false);
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowPerPage = 6;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(classRooms.length / rowPerPage);
    const getClassRooms = async () => {
        try {
            const response = await appClient.get("api/classrooms");
            const dataRes = response.data;
            if (dataRes.success) {
                setClassRooms(dataRes.message);
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

    const handleDeleteClassRoom = (classRoomId) => {
        let newClassRooms = classRooms.filter(c => c.classRoomId != classRoomId);
        newClassRooms = newClassRooms.map((item, index) => ({ ...item, index: index + 1 }));
        setClassRooms(newClassRooms);
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
        if (sortConfig.length === 0) return [...classRooms];

        return [...classRooms].sort((a, b) => {
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
    }, [classRooms, sortConfig])

    useEffect(() => {
        // if (searchValue != "") {
        //     setSortedData(prev => {
        //         let newPrev = prev.filter(item => {
        //             const fullName = removeVietnameseAccents(item.name).toLowerCase();
        //             const search = removeVietnameseAccents(searchValue.toLowerCase());
        //             return fullName.includes(search);
        //         })
        //         return newPrev;
        //     })
        // }
        // else {
        //     setSortedData(sortedDataFunc());
        // }
    }, [searchValue])

    useEffect(() => {
        getClassRooms();
    }, [])

    return (
        <div className='p-[20px] h-full'>
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
                        <button className='cmp__add-class--btn ml-[20px]' onClick={(e) => setIsShowClassroomBoard(!isShowClassroomBoard)}>
                            {
                                !isShowClassroomBoard ?
                                    "Add Classroom"
                                    :
                                    "Hide Board"
                            }
                        </button>
                    }
                </div>
            </div>

            <ClassRoomAddBoard isShow={isShowClassroomBoard} onShow={setIsShowClassroomBoard} onReloadClassroom={getClassRooms} />

            <div className='clb__wrapper'>
                <div className="clb__tbl__wrapper mt-[20px] ">
                    <div className="mpt__header flex w-full items-center">
                        <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("index", event)}>No</div>
                        <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("classRoomName", event)}>Classroom</div>
                        <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("capacity", event)}>Capacity</div>
                        <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("location", event)}>Location</div>
                        <div className="mpt__header-item w-1/6"></div>
                    </div>

                    <div className='mpt__body min-h-[480px] mt-[10px]'>
                        {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                            return (
                                <ClassRoomItem
                                    data={item}
                                    key={index}
                                    index={item.index}
                                    onDelete={handleDeleteClassRoom}
                                    onReload={getClassRooms}
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

function ClassRoomItem({ data, index, onDelete, onReload }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isShowSchedule, setIsShowSchedule] = useState(false);
    const inputNameRef = useRef(null);
    const inputCapacityRef = useRef(null);
    const inputLocationRef = useRef(null);

    const handleShowSchedule = (event) => {
        setIsShowSchedule(true);
    }

    const handleEditClassRoom = async (event) => {
        event.stopPropagation();
        event.preventDefault();
        if (!isEditing) {
            setIsEditing(!isEditing);
        }
        else {
            if (inputNameRef.current && (inputNameRef.current.value == "" || inputNameRef.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Name is required",
                    duration: 4000
                });

                inputNameRef.current.classList.toggle("input-error");
                inputNameRef.current.focus();

                setTimeout(() => {
                    inputNameRef.current.classList.toggle("input-error");
                }, 2000);

                return;
            }

            if (inputCapacityRef.current && (inputCapacityRef.current.value == "" || inputCapacityRef.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Capacity is required",
                    duration: 4000
                });

                inputCapacityRef.current.classList.toggle("input-error");
                inputCapacityRef.current.focus();

                setTimeout(() => {
                    inputCapacityRef.current.classList.toggle("input-error");
                }, 2000);

                return;
            }
            else {
                if (inputCapacityRef.current.value == 0) {
                    toast({
                        type: "error",
                        title: "ERROR",
                        message: "Capacity must be greater than 0",
                        duration: 4000
                    });

                    inputCapacityRef.current.classList.toggle("input-error");
                    inputCapacityRef.current.focus();

                    setTimeout(() => {
                        inputCapacityRef.current.classList.toggle("input-error");
                    }, 2000);

                    return;
                }
            }

            if (inputLocationRef.current && (inputLocationRef.current.value == "" || inputLocationRef.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Location is required",
                    duration: 4000
                });

                inputLocationRef.current.classList.toggle("input-error");
                inputLocationRef.current.focus();

                setTimeout(() => {
                    inputLocationRef.current.classList.toggle("input-error");
                }, 2000);

                return;
            }

            try {
                const formData = new FormData();
                formData.append("ClassRoomName", inputNameRef.current.value);
                formData.append("Capacity", parseInt(inputCapacityRef.current.value));
                formData.append("Location", inputLocationRef.current.value);

                const response = await appClient.put(`api/classrooms/${data.id}`, formData);
                const dataRes = response.data;
                if (dataRes.success) {
                    toast({
                        type: "success",
                        title: "Successfully",
                        message: "Update classroom successfully",
                        duration: 4000
                    });

                    onReload();
                }
                setIsEditing(false);
            }
            catch {
                onReload();
                setIsEditing(false);
            }

        }
    }

    const handleChangeCapacity = async () => {
        if (inputCapacityRef.current) {
            inputCapacityRef.current.value = event.target.value.replace(/[^0-9]/g, '');
        }
    }

    const handleRemoveClick = async (event) => {
        event.stopPropagation();
        event.preventDefault();

        try {
            var confirmAnswer = confirm("Are you sure to delete this classroom");
            if (!confirmAnswer) return;

            const response = await appClient.delete(`api/classrooms/${data.id}`);
            const dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Successfully",
                    message: "Delete classroom successfully",
                    duration: 4000
                });

                onDelete(data.id);
                onReload();
                return;
            }
        }
        catch {

        }
    }

    useEffect(() => {
        inputNameRef.current.value = data.classRoomName ?? "";
        inputCapacityRef.current.value = data.capacity ?? "";
        inputLocationRef.current.value = data.location ?? "";
        console.log(data);
    }, [data])

    return (
        <>
            <div className={`mpt__row flex items-center mb-[10px] ${isEditing && "editing"}`} onClick={handleShowSchedule}>
                <div className="mpt__row-item w-1/12 "># {index}</div>
                <div className="mpt__row-item w-1/4 " onClick={(e) => {
                    if (isEditing) e.stopPropagation();
                }}>
                    <input
                        className={`rmei__input h-[40px] ${isEditing ? "bg-white border !cursor-auto" : "bg-transparent"}`}
                        name='Name'
                        ref={inputNameRef}
                        readOnly={!isEditing}
                    />
                </div>

                <div className="mpt__row-item w-1/4 " onClick={(e) => {
                    if (isEditing) e.stopPropagation();
                }}>
                    <input
                        className={`rmei__input h-[40px] ${isEditing ? "bg-white border !cursor-auto" : "bg-transparent"}`}
                        name='Name'
                        ref={inputCapacityRef}
                        onChange={handleChangeCapacity}
                        readOnly={!isEditing}
                    />
                </div>

                <div className="mpt__row-item w-1/4 " onClick={(e) => {
                    if (isEditing) e.stopPropagation();
                }}>
                    <input
                        className={`rmei__input h-[40px] ${isEditing ? "bg-white border !cursor-auto" : "bg-transparent"}`}
                        name='Name'
                        ref={inputLocationRef}
                        readOnly={!isEditing}
                    />
                </div>
                <div className="mpt__row-item w-1/6 flex justify-end">
                    <button className='mpt__item--btn' onClick={handleEditClassRoom}>
                        {
                            !isEditing ?
                                <img src={IMG_URL_BASE + "edit-icon.svg"} className='w-[25px] p-[3px]' />
                                :
                                <img src={IMG_URL_BASE + "check_thin_icon.svg"} className='w-[25px]' />
                        }
                    </button>
                    {
                        <button className='mpt__item--btn' onClick={handleRemoveClick}>
                            <img src={IMG_URL_BASE + "close.svg"} className='w-[25px] p-[3px]' />
                        </button>
                    }
                </div>
            </div>
            {isLoading && <LoaderPage />}
            {isShowSchedule && <ClassRoomSchedule onShow={setIsShowSchedule} classRoomInfo={data} />}
        </>
    )
}

function ClassRoomSchedule({ onShow, classRoomInfo }) {
    const [lessons, setLessons] = useState([]);
    const [startOfWeek, setStartOfWeek] = useState("");
    const [endOfWeek, setEndOfWeek] = useState("");
    const timeLine = Array.from({ length: 12 }, (_, index) => index + 1);
    const [groupSchedules, setGroupSchedules] = useState(null);
    const [weekOffset, setWeekOffset] = useState(0);

    const getWeekRange = (offset = 0) => {
        const currentDate = new Date();

        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + offset * 7);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return { startOfWeek, endOfWeek };
    }

    const groupScheduleByWeek = (lessons, offset = 0) => {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        const weekObject = daysOfWeek.reduce((acc, day) => {
            acc[day] = [];
            return acc;
        }, {});

        const { startOfWeek, endOfWeek } = getWeekRange(offset);
        const startOfDay = new Date(startOfWeek.setHours(0, 0, 0, 0));
        const endOfDay = new Date(endOfWeek.setHours(23, 59, 59, 999));


        lessons.forEach(schedule => {
            const scheduleTime = new Date(schedule.date)

            if (startOfDay <= scheduleTime && scheduleTime <= endOfDay) {
                if (weekObject[schedule.dayOfWeek]) {
                    weekObject[schedule.dayOfWeek].push(schedule);
                }
            }
        })

        const formatDate = (date) =>
            date.toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
            });


        return { weekObject, startOfWeek: formatDate(startOfWeek), endOfWeek: formatDate(endOfWeek) };
    }

    const getLessons = async () => {
        try {
            let response = await appClient.get(`api/classrooms/${classRoomInfo.id}/lessons`);
            let dataRes = response.data;
            if (dataRes.success) {
                setLessons(dataRes.message);
            }
        }
        catch {

        }
    }

    const RenderItemWithNumber = (data, number, index) => {
        for (const item of data) {
            if (number >= item.startPeriod && number <= item.endPeriod) {
                return number === item.startPeriod ?
                    <ScheduleItem rowSpan={item.endPeriod - item.startPeriod + 1} data={item} key={index} />
                    :
                    null;
            }
        }

        return (
            <div className={`sp__row-item ${index % 2 === 0 ? "odd" : "even"}`} key={index}></div>
        )
    }

    useEffect(() => {
        getLessons();
    }, [classRoomInfo])

    useEffect(() => {
        if (lessons.length != 0) {
            const { weekObject, startOfWeek, endOfWeek } = groupScheduleByWeek(lessons, weekOffset);

            setGroupSchedules(weekObject);
            setStartOfWeek(startOfWeek);
            setEndOfWeek(endOfWeek);
        }
    }, [lessons])

    useEffect(() => {
        const { weekObject, startOfWeek, endOfWeek } = groupScheduleByWeek(lessons, weekOffset);
        setGroupSchedules(weekObject);
        setStartOfWeek(startOfWeek);
        setEndOfWeek(endOfWeek);
    }, [weekOffset])

    return (
        <div className='fixed top-0 left-0 z-[1000] ridv__wrapper w-full h-full flex items-center justify-center' onClick={(e) => onShow(false)} >
            <div className='w-[1000px] h-[600px] flex flex-col bg-white rounded-[10px] shadow-md p-[20px]' onClick={(e) => e.stopPropagation()}>
                <div className='flex justify-between items-center mb-[20px]'>
                    <div className='flex items-center '>
                        <div className='sp__title-time'>{startOfWeek}</div>
                        <div className='mx-[10px]'>~</div>
                        <div className='sp__title-time'>{endOfWeek}</div>
                    </div>

                    <div className='flex items-center'>
                        <button className='sp__btn-calender' onClick={(e) => setWeekOffset(prev => prev - 1)}>Previous</button>
                        <button className='sp__btn-calender ml-[10px]' onClick={(e) => setWeekOffset(prev => prev + 1)}>Next</button>
                    </div>
                </div>
                <div className='sp__tbl--warpper flex-1 flex'>
                    {
                        groupSchedules && Object.keys(groupSchedules).map((dayOfWeek, index) => {
                            return (
                                <div className='sp__tbl-col overflow-visible' key={index}>
                                    <div className='sp__tbl-header'>{dayOfWeek}</div>

                                    <div className='flex-1 sp__tbl_row--wrapper overflow-visible'>
                                        {timeLine.map((item, index) => {
                                            return RenderItemWithNumber(groupSchedules[dayOfWeek], item, index)
                                        })}
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
        </div>
    )
}

function ScheduleItem({ rowSpan, data }) {
    const heightStr = `calc(100% / 12 * ${rowSpan})`;

    return (
        <div style={{ height: heightStr }} className='sp__row-item lesson cursor-pointer'>
            <div className='h-full  w-full justify-center flex flex-col p-[10px] sp__row-item-lesson'>
                {rowSpan != 1 &&
                    <>
                        <div className='flex-1 w-full flex flex-col justify-center items-center overflow-y-hidden'>
                            <div className='sp__row-item__topic line-clamp-3 text-center mb-[10px] !text-[12px]'>{data.topic}</div>
                            <div className='sp__row-item__class-room overflow-hidden !text-[12px]'>{data.classId}</div>
                        </div>
                        <div className='flex w-full items-end'>
                            <div className='sp__row-item__date'>
                                <img src={IMG_URL_BASE + "calendar-icon-1.svg"} className='w-[15px]' />
                            </div>
                            <div className='sp__row-item__date flex-1 ml-[10px] text-center'>{data.date}</div>
                        </div>

                        <div className='flex w-full items-end mt-[5px]'>
                            <div className='sp__row-item__date'>
                                <img src={IMG_URL_BASE + "clock-icon-1.svg"} className='w-[15px]' />
                            </div>
                            <div className='sp__row-item__date flex-1 ml-[10px] text-center'>{data.startPeriodTime} ~ {data.endPeriodTime}</div>
                        </div>
                    </>
                }

                {
                    rowSpan == 1 && 
                    <div className='overflow-hidden text-center sp__row-item__class-room'>
                        {data.classId}
                    </div>
                }
            </div>
        </div>
    )
}

function ClassRoomAddBoard({ isShow, onShow, onReloadClassroom }) {
    const [isLoading, setIsLoading] = useState(false);
    const inputNameRef = useRef(null);
    const inputCapacityRef = useRef(null);
    const inputLocationRef = useRef(null);

    const handleResetInput = () => {
        inputNameRef.current.value = "";
        inputCapacityRef.current.value = "";
        inputLocationRef.current.value = "";
    }

    const handleSubmitClassRoom = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            if (inputNameRef.current && (inputNameRef.current.value == "" || inputNameRef.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Name is required",
                    duration: 4000
                });

                inputNameRef.current.classList.toggle("input-error");
                inputNameRef.current.focus();

                setTimeout(() => {
                    inputNameRef.current.classList.toggle("input-error");
                }, 2000);

                setIsLoading(false);
                return;
            }

            if (inputCapacityRef.current && (inputCapacityRef.current.value == "" || inputCapacityRef.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Capacity is required",
                    duration: 4000
                });

                inputCapacityRef.current.classList.toggle("input-error");
                inputCapacityRef.current.focus();

                setTimeout(() => {
                    inputCapacityRef.current.classList.toggle("input-error");
                }, 2000);

                setIsLoading(false);

                return;
            }
            else {
                if (inputCapacityRef.current.value == 0) {
                    toast({
                        type: "error",
                        title: "ERROR",
                        message: "Capacity must be greater than 0",
                        duration: 4000
                    });

                    inputCapacityRef.current.classList.toggle("input-error");
                    inputCapacityRef.current.focus();

                    setTimeout(() => {
                        inputCapacityRef.current.classList.toggle("input-error");
                    }, 2000);

                    setIsLoading(false);

                    return;
                }
            }

            if (inputLocationRef.current && (inputLocationRef.current.value == "" || inputLocationRef.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Location is required",
                    duration: 4000
                });

                inputLocationRef.current.classList.toggle("input-error");
                inputLocationRef.current.focus();

                setTimeout(() => {
                    inputLocationRef.current.classList.toggle("input-error");
                }, 2000);

                setIsLoading(false);

                return;
            }


            const formData = new FormData();
            formData.append("ClassRoomName", inputNameRef.current.value.toUpperCase());
            formData.append("Capacity", parseInt(inputCapacityRef.current.value));
            formData.append("Location", inputLocationRef.current.value);

            const response = await appClient.post("api/classrooms", formData);
            const dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Success",
                    message: "Create classroom successfully",
                    duration: 4000
                });

                handleResetInput();
                onShow(false);
                onReloadClassroom();
            }

            setIsLoading(false);
        }
        catch {
            setIsLoading(false);
        }

    }


    const handleChangeCapacity = (event) => {
        if (inputCapacityRef.current) {
            inputCapacityRef.current.value = event.target.value.replace(/[^0-9]/g, '');
        }
    }

    return (
        <div className={`w-full h-[200px] mt-[20px] cab__wrapper p-[20px] border rounded-[10px] overflow-visible ${isShow ? "block" : "hidden"} p-[10px]`}>
            <form onSubmit={handleSubmitClassRoom}>
                <div className="flex items-center">
                    <div className="flex items-center flex-1">
                        <div className='cab__title--text'>Name</div>
                        <input
                            name='ClassRoomName'
                            className='cab__input-text uppercase'
                            ref={inputNameRef}
                        />
                    </div>

                    <div className="flex items-center flex-1">
                        <div className='cab__title--text'>Capacity</div>
                        <input
                            name='Capacity'
                            className='cab__input-text'
                            onChange={(e) => handleChangeCapacity(e)}
                            ref={inputCapacityRef}
                        />
                    </div>
                </div>

                <div className="flex items-center  mt-[20px]">
                    <div className='cab__title--text'>Location</div>
                    <input
                        name='Location'
                        className='cab__input-text'
                        ref={inputLocationRef}
                    />
                </div>

                <div className='flex justify-end mt-[15px]'>
                    <button className='cabf__btn--func' type='submit'>
                        Create
                    </button>
                </div>
            </form>
        </div>
    )
}

export default ClassRoomPageAdmin