import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE } from '~/GlobalConstant.js';

function SchedulePage({ enrollId }) {
    const navigate = useNavigate();
    const timeLine = Array.from({ length: 12 }, (_, index) => index + 1);
    const [schedules, setSchedules] = useState([]);
    const [groupSchedules, setGroupSchedules] = useState(null);
    const [weekOffset, setWeekOffset] = useState(0);
    const [startOfWeek, setStartOfWeek] = useState("");
    const [endOfWeek, setEndOfWeek] = useState("");
    const [periodTables, setPeriodTables] = useState([]);

    const getWeekRange = (offset = 0) => {
        const currentDate = new Date();

        const startOfWeek = new Date(currentDate);
        startOfWeek.setDate(currentDate.getDate() - currentDate.getDay() + offset * 7);

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);

        return { startOfWeek, endOfWeek };
    }

    const groupScheduleByWeek = (schedules, offset = 0) => {
        const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

        const weekObject = daysOfWeek.reduce((acc, day) => {
            acc[day] = [];
            return acc;
        }, {});

        const { startOfWeek, endOfWeek } = getWeekRange(offset);

        schedules.forEach(schedule => {
            const scheduleTime = new Date(schedule.date)
            if (startOfWeek <= scheduleTime && scheduleTime <= endOfWeek) {
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


    useEffect(() => {
        const getClassSchedules = async () => {
            try {
                const response = await appClient.get(`api/Lessons/enrolls/${enrollId}`);
                const dataRes = response.data;
                if (dataRes.success) {
                    setSchedules(dataRes.message);
                }
            }
            catch {
                navigate(-1);
            }
        }

        getClassSchedules();
    }, [])

    useEffect(() => {
        const getPeriodTables = async () => {
            try {
                const response = await appClient.get("api/TimePeriod");
                const resData = response.data;

                if (resData.success) {
                    setPeriodTables(resData.message);
                }
            }
            catch {

            }
        }

        getPeriodTables();
    }, [])


    useEffect(() => {
        if (schedules.length != 0) {
            const { weekObject, startOfWeek, endOfWeek } = groupScheduleByWeek(schedules, weekOffset);

            setGroupSchedules(weekObject);
            setStartOfWeek(startOfWeek);
            setEndOfWeek(endOfWeek);
        }
    }, [schedules])

    useEffect(() => {
        const { weekObject, startOfWeek, endOfWeek } = groupScheduleByWeek(schedules, weekOffset);
        setGroupSchedules(weekObject);
        setStartOfWeek(startOfWeek);
        setEndOfWeek(endOfWeek);
    }, [weekOffset])

    const RenderItemWithNumber = (data, number, index) => {
        for (const item of data) {
            if (number >= item.startPeriod && number <= item.endPeriod) {
                return number === item.startPeriod ?
                    <LessionItem rowSpan={item.endPeriod - item.startPeriod + 1} data={item} key={index} />
                    :
                    null;
            }
        }
        return (
            <div className={`sp__row-item ${index % 2 === 0 ? "odd" : "even"}`} key={index}></div>
        )
    }

    return (
        <div className='flex w-full p-[30px] flex-col'>
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
            <div className='sp__tbl--warpper flex w-full h-[600px]'>
                <div className='sp__tbl-col !flex-none w-[60px]'>
                    <div className='sp__tbl-header first-col'></div>
                    <div className='flex-1 sp__tbl_row--wrapper'>
                        {timeLine.map((item, index) => {
                            return (
                                <div className='sp__row-item' key={index}>
                                    {item}
                                </div>
                            )
                        })}
                    </div>
                </div>
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

            <div className='sp__tpt--wrapper mt-[20px]'>
                <div className='sp__tpt-title'>Time period table</div>

                <div className='flex justify-center mt-[20px]'>
                    <div className='sp__tpt-table'>
                        {
                            periodTables &&

                            periodTables.slice(0, 6).map((item, index) => {
                                return (
                                    <div className={`sp__tpt-row items-center justify-center ${index == 5 && "last-item"}`} key={index}>
                                        <div className='sp__tpt-item w-[50px]'>{timeLine[index]}</div>
                                        <div className='sp__tpt-item w-[100px] '>{item.startTime}</div>
                                        <div className={`sp__tpt-item w-[100px] border-r border-r-[#cccccc]`}>{item.endTime}</div>
                                    </div>
                                )
                            })
                        }
                    </div>

                    <div className='sp__tpt-table ml-[40px]'>
                        {
                            periodTables &&

                            periodTables.slice(6).map((item, index) => {
                                return (
                                    <div className={`sp__tpt-row items-center justify-center ${index == 5 && "last-item"}`} key={index}>
                                        <div className='sp__tpt-item w-[50px]'>{timeLine[index + 6]}</div>
                                        <div className='sp__tpt-item w-[100px] '>{item.startTime}</div>
                                        <div className={`sp__tpt-item w-[100px] border-r border-r-[#cccccc]`}>{item.endTime}</div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

function LessionItem({ rowSpan, data }) {
    const heightStr = `calc(100% / 12 * ${rowSpan})`;
    return (
        <div style={{ height: heightStr }} className='sp__row-item lesson cursor-pointer'>
            <div className='h-full w-full flex flex-col p-[10px] sp__row-item-lesson'>
                <div className='flex-1 w-full flex flex-col justify-center items-center'>
                    <div className='sp__row-item__topic line-clamp-1 '>{data.topic}</div>
                    <div className='sp__row-item__class-room'>{data.classRoom.classRoomName}</div>
                </div>
                <div className='flex w-full items-end'>
                    <div className='sp__row-item__date'>
                        <img src={IMG_URL_BASE + "calendar-icon-1.svg"} className='w-[18px]' />
                    </div>
                    <div className='sp__row-item__date flex-1 ml-[10px]'>{data.date}</div>
                </div>

                <div className='flex w-full items-end mt-[5px]'>
                    <div className='sp__row-item__date'>
                        <img src={IMG_URL_BASE + "clock-icon-1.svg"} className='w-[18px]' />
                    </div>
                    <div className='sp__row-item__date flex-1 ml-[10px]'>{data.startPeriodTime} ~ {data.endPeriodTime}</div>
                </div>
            </div>
        </div>
    )
}

export default SchedulePage