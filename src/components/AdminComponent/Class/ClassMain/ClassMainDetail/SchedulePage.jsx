import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import DropDownList from '../../../../CommonComponent/DropDownList';
import toast from '@/helper/Toast';
import { IMG_URL_BASE } from '~/GlobalConstant.js';

function SchedulePage() {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [isShowBoard, setIsShowBoard] = useState(false);
    const [classRooms, setClassRooms] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [dayOfWeek, setDayOfWeek] = useState([]);
    const [timePeriods, setTimePeriods] = useState([]);

    const getClassSchedule = async () => {
        try {
            const response = await appClient.get(`api/ClassSchedules/classes/${classId}`)
            const dataRes = response.data;
            if (dataRes.success) {
                setSchedules(dataRes.message.map((item,index) => ({...item, index: index + 1})));
            }
        }
        catch {

        }
    }

    const getDayOfWeek = async () => {
        try {
            const response = await appClient.get(`api/ClassSchedules/day-of-week`)
            const dataRes = response.data;
            if (dataRes.success) {
                setDayOfWeek(dataRes.message);
            }
        }
        catch {

        }
    }

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

    const getPeriods = async () => {
        try {
            const response = await appClient.get("api/TimePeriod");
            const dataRes = response.data;
            if (dataRes.success) {
                setTimePeriods(dataRes.message);
            }
        }
        catch {

        }
    }

    useState(() => {
        if (classId == null) {
            navigate(-1);
            return;
        }

        getClassSchedule();
        getClassRooms();
        getDayOfWeek();
        getPeriods();
    }, [])


    const handleGenerateLesson = async () => {
        try {
            const response = await appClient.put(`api/classschedules/class/${classId}`);
            const dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Successfully",
                    message: "Generate lessons successfully",
                    duration: 4000
                });

                return;
            }
        }
        catch {

        }
    }

    return (
        <div className='sp__wrapper px-[20px]'>
            <div className='flex items-center justify-between'>
                <div className='sp__title'>Schedule In Week</div>
                <div className='flex items-center'>
                    <button className='sp__add-schedule--btn mr-[10px]' onClick={handleGenerateLesson}>
                        Generate Lessons
                    </button>
                    <button className='sp__add-schedule--btn' onClick={(e) => setIsShowBoard(!isShowBoard)}>
                        {
                            !isShowBoard ?
                                "Add Schedule"
                                :
                                "Hide Schedule"
                        }
                    </button>
                </div>
            </div>

            {isShowBoard && <ScheduleAddBroad dayOfWeek={dayOfWeek} timePeriods={timePeriods} classRooms={classRooms} classId={classId} onShow={setIsShowBoard} onReloadSchedule={getClassSchedule} />}

            <ScheduleListBroad schedules={schedules} onChangeSchedule={setSchedules} />
        </div>
    )
}

function ScheduleListBroad({ schedules, onChangeSchedule }) {
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const rowPerPage = 6;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(schedules.length / rowPerPage);

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

    const handleDeteteSchedule = (scheduleId) => {
        let newSchedule = schedules.filter(u => u.scheduleId != scheduleId);
        newSchedule = newSchedule.map((item,index) => ({...item,index: index + 1}));
        onChangeSchedule(newSchedule);
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
        if (sortConfig.length === 0) return [...schedules];

        return [...schedules].sort((a, b) => {
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
    }, [schedules, sortConfig])

    return (
        <div className='slb__wrapper mt-[20px]'>
            <div className="mpt__header flex w-full">
                <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("index", event)}>No</div>
                <div className="mpt__header-item w-1/6" onClick={(event) => handleSort("dayOfWeek", event)}>Day of week</div>
                <div className="mpt__header-item w-1/6" onClick={(event) => handleSort("startPeriod", event)}>Start Period</div>
                <div className="mpt__header-item w-1/6" onClick={(event) => handleSort("endPeriod", event)}>End Period</div>
                <div className="mpt__header-item w-1/6" onClick={(event) => handleSort("classRoomInfo.classRoomName", event)}>Class Room</div>
                <div className="mpt__header-item w-1/6" onClick={(event) => handleSort("classRoomInfo.location", event)}>Location</div>
                <div className="mpt__header-item w-1/12 "></div>
            </div>

            <div className='mpt__body min-h-[390px] mt-[10px]'>
                {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                    return (
                        <ScheduleItem scheduleInfo={item} key={index} index={item.index} onDeleteItem={handleDeteteSchedule} />
                    )
                })}

                {sortedData.length == 0 &&
                    <div className='w-full h-[390px] flex items-center justify-center'>
                        <span className='er__no-enrolls'>There are no schedules at this time.</span>
                    </div>
                }
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
    )
}

function ScheduleItem({ scheduleInfo, index, onDeleteItem }) {
    const handleRemoveClick = async () => {
        const response = await appClient.delete(`api/classschedules/${scheduleInfo.scheduleId}`);
        const dataRes = response.data;
        if (dataRes.success) {
            toast({
                type: "success",
                title: "Successfully",
                message: "Delete schedule successfully",
                duration: 4000
            });

            onDeleteItem(scheduleInfo.scheduleId);
        }
    }
    return (
        <div className='mpt__row flex items-center mb-[10px]'>
            <div className="mpt__row-item w-1/12 "># {index}</div>
            <div className="mpt__row-item w-1/6 ">{scheduleInfo.dayOfWeekStr}</div>
            <div className="mpt__row-item w-1/6 ">{scheduleInfo.startPeriodStr.split("-")[0]}</div>
            <div className="mpt__row-item w-1/6 ">{scheduleInfo.endPeriodStr.split("-")[1]}</div>
            <div className="mpt__row-item w-1/6 ">{scheduleInfo.classRoomInfo.classRoomName}</div>
            <div className="mpt__row-item w-1/6 ">{scheduleInfo.classRoomInfo.location}</div>
            <div className="mpt__row-item w-1/12 ">
                <button className='mpt__item--btn' onClick={handleRemoveClick}>
                    <img src={IMG_URL_BASE + "close.svg"} className='w-[30px] p-[6px]' />
                </button>
            </div>
        </div>
    )
}

function ScheduleAddBroad({ dayOfWeek, timePeriods, classRooms, classId, onShow, onReloadSchedule }) {
    const [indexDay, setIndexDay] = useState(-1);
    const [indexClassRoom, setIndexClassRoom] = useState(-1);
    const [indexStart, setIndexStart] = useState(-1);
    const [indexEnd, setIndexEnd] = useState(-1);
    const [selectedDayOfWeek, setSelectedDayOfWeek] = useState(null);
    const [selectedClassRoom, setSelectedClassRoom] = useState(null);
    const [selectedStartPeriod, setSelectedStartPeriod] = useState(null);
    const [selectedEndPeriod, setSelectedEndPeriod] = useState(null);
    const [isCorrectDayOfWeek, setIsCorrectDayOfWeek] = useState(true);
    const [isCorrectClassRoom, setIsCorrectClassRoom] = useState(true);
    const [isCorrectStartPeriod, setIsCorrectStartPeriod] = useState(true);
    const [isCorrectEndPeriod, setIsCorrectEndPeriod] = useState(true);

    const handleSelectedDayOfWeek = (item, index) => {
        setSelectedDayOfWeek(item);
        setIndexDay(index)
    }

    const handleSelectedClassRoom = (item, index) => {
        setSelectedClassRoom(item);
        setIndexClassRoom(index);
    }

    const handleSelectedStartPeriod = (item, index) => {
        setSelectedStartPeriod(item);
        setIndexStart(index);
    }

    const handleSelectedEndPeriod = (item, index) => {
        setSelectedEndPeriod(item);
        setIndexEnd(index);
    }

    const handleClearInput = () => {
        setIndexDay(-1);
        setIndexClassRoom(-1);
        setIndexStart(-1);
        setIndexEnd(-1);
    }

    const handleSubmitSchedule = async () => {
        if (selectedDayOfWeek == null) {
            toast({
                type: "error",
                title: "ERROR",
                message: "Day of week is required",
                duration: 4000
            });

            setIsCorrectDayOfWeek(false);

            setTimeout(() => {
                setIsCorrectDayOfWeek(true);
            }, (2000));

            return;
        }

        if (selectedClassRoom == null) {
            toast({
                type: "error",
                title: "ERROR",
                message: "Class room is required",
                duration: 4000
            });

            setIsCorrectClassRoom(false);

            setTimeout(() => {
                setIsCorrectClassRoom(true);
            }, (2000));

            return;
        }

        if (selectedStartPeriod == null) {
            toast({
                type: "error",
                title: "ERROR",
                message: "Start period is required",
                duration: 4000
            });

            setIsCorrectStartPeriod(false);

            setTimeout(() => {
                setIsCorrectStartPeriod(true);
            }, (2000));

            return;
        }

        if (selectedEndPeriod == null) {
            toast({
                type: "error",
                title: "ERROR",
                message: "End period is required",
                duration: 4000
            });

            setIsCorrectEndPeriod(false);

            setTimeout(() => {
                setIsCorrectEndPeriod(true);
            }, (2000));

            return;
        }

        if (selectedStartPeriod.value > selectedEndPeriod.value) {
            toast({
                type: "error",
                title: "ERROR",
                message: "Start period must be less than end period",
                duration: 4000
            });


            setIsCorrectEndPeriod(false);
            setIsCorrectStartPeriod(false);

            setTimeout(() => {
                setIsCorrectEndPeriod(true);
                setIsCorrectStartPeriod(true);
            }, (2000));

            return;
        }

        try {
            const formData = new FormData();
            formData.append("ClassId", classId);
            formData.append("DayOfWeek", selectedDayOfWeek.value);
            formData.append("StartPeriod", selectedStartPeriod.value);
            formData.append("EndPeriod", selectedEndPeriod.value);
            formData.append("ClassRoomId", selectedClassRoom.value);

            const response = await appClient.post("api/classschedules", formData);
            const dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Successfully",
                    message: "Create schedule successfully",
                    duration: 4000
                });
                handleClearInput();
                onReloadSchedule();
                onShow(false);
                return;
            }
        }
        catch {

        }
    }

    return (
        <div className='w-full mt-[10px] bg-white spas__wrapper p-[20px] overflow-visible border rounded-[8px]'>
            <div className='flex items-center overflow-visible'>
                <div className='flex overflow-visible items-center flex-1'>
                    <div className='sab__title'>Day of week</div>
                    <DropDownList data={dayOfWeek} className={`!rounded-[8px] border ${isCorrectDayOfWeek == false && "border-red-500"}`} defaultIndex={indexDay} onSelectedItem={handleSelectedDayOfWeek} />
                </div>

                <div className='flex overflow-visible items-center flex-1'>
                    <div className='sab__title'>Class Room</div>
                    <DropDownList data={classRooms.map((item) => ({ value: item.id, key: item.classRoomName }))} onSelectedItem={handleSelectedClassRoom} defaultIndex={indexClassRoom} className={`!rounded-[8px] border ${isCorrectClassRoom == false && "border-red-500"}`} />
                </div>
            </div>

            <div className='flex items-center overflow-visible mt-[20px]'>
                <div className='flex overflow-visible items-center flex-1'>
                    <div className='sab__title'>Start Period</div>
                    <DropDownList data={Array.from({ length: 12 }, (_, i) => ({ key: i + 1, value: i + 1 }))} onSelectedItem={handleSelectedStartPeriod} defaultIndex={indexStart} className={`!rounded-[8px] border ${isCorrectStartPeriod == false && "border-red-500"}`} />
                </div>

                <div className='flex overflow-visible items-center flex-1'>
                    <div className='sab__title'>End Period</div>
                    <DropDownList data={Array.from({ length: 12 }, (_, i) => ({ key: i + 1, value: i + 1 }))} onSelectedItem={handleSelectedEndPeriod} defaultIndex={indexEnd} className={`!rounded-[8px] border ${isCorrectEndPeriod == false && "border-red-500"}`} />
                </div>
            </div>

            <div className='flex items-start overflow-visible mt-[20px]'>
                <div className='sab__title'>Time Line</div>

                <div className='flex justify-start flex-1'>
                    <div className='sp__tpt-table'>
                        {
                            timePeriods &&

                            timePeriods.slice(0, 6).map((item, index) => {
                                return (
                                    <div className={`sab__row-wrapper items-center justify-center ${index == 5 && "last-item"}`} key={index}>
                                        <div className='sab__row-item w-[55px]'>{index + 1}</div>
                                        <div className='sab__row-item w-[120px] '>{item.startTime}</div>
                                        <div className={`sab__row-item w-[120px] border-r border-r-[#cccccc]`}>{item.endTime}</div>
                                    </div>
                                )
                            })
                        }
                    </div>

                    <div className='sp__tpt-table ml-[125px]'>
                        {
                            timePeriods &&

                            timePeriods.slice(6).map((item, index) => {
                                return (
                                    <div className={`sab__row-wrapper items-center justify-center ${index == 5 && "last-item"}`} key={index}>
                                        <div className='sab__row-item w-[55px]'>{index + 1 + 6}</div>
                                        <div className='sab__row-item w-[120px] '>{item.startTime}</div>
                                        <div className={`sab__row-item w-[120px] border-r border-r-[#cccccc]`}>{item.endTime}</div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>

            <div className='flex justify-end mt-[20px]'>
                <button className='sab__btn-func mr-[20px]' onClick={handleSubmitSchedule}>Submit</button>
                <button className='sab__btn-func' onClick={handleClearInput}>Clear</button>
            </div>
        </div>
    )
}

export default SchedulePage