import React, { useCallback, useEffect, useState } from 'react'
import * as signalR from '@microsoft/signalr';
import "./CalendarEventStyle.css"
import { IMG_URL_BASE } from '~/GlobalConstant';
import AddEvent from './AddEvent';
import EventItem from './EventItem';
import { appClient } from '~/AppConfigs';
import { APP_API } from '~/GlobalConstant.js';
import toast from '@/helper/Toast';

function CalendarEvent() {
    const [notiConnection, setNotiConnection] = useState(null);
    useEffect(() => {
        const connectNotificationServer = async () => {
            const notiConnection = new signalR.HubConnectionBuilder()
                .withUrl(`${APP_API}hub/notification`, {
                    withCredentials: true
                })
                .withAutomaticReconnect([3000, 3000, 3000])
                .configureLogging(signalR.LogLevel.Information)
                .build();

            try {
                await notiConnection.start();
            } catch (err) {
                // toast({
                //     type: "error",
                //     duration: 5000,
                //     title: "Error",
                //     message: err.message
                // })
                console.error(err.message);
            }

            setNotiConnection(notiConnection);
        }

        connectNotificationServer();

        return()=>{
            if(notiConnection){
                notiConnection.stop().catch(e => {
                    // toast({
                    //     type: "error",
                    //     duration: 5000,
                    //     title: "SignalR Connection Error",
                    //     message: e.message
                    // })
                });
            }
        }
    }, [])

    const weekDay = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const [currentDay, setCurrentDay] = useState(new Date());
    const [notiInWeek, setNotiInWeek] = useState([]);
    const [dayOfWeek, setDayOfWeek] = useState(() => {
        const today = new Date();
        const daysSinceMonday = (today.getDay() - 1 + 7) % 7; // Tính số ngày kể từ thứ 2 gần nhất
        const lastMonday = new Date(today);
        lastMonday.setDate(today.getDate() - daysSinceMonday);

        var result = [];

        result.push(lastMonday.toISOString().split("T")[0]);

        for (let i = 0; i < 6; i++) {
            lastMonday.setDate(lastMonday.getDate() + 1);
            const lastMondayFormat = lastMonday.toISOString().split("T")[0];
            result.push(lastMondayFormat);
        }

        return result;
    })

    const [events, setEvents] = useState([]);

    const getScheduleEventsWithDate = useCallback(async (date) => {
        try {
            const response = await appClient.get(`api/events/date/${date}`);
            const data = response.data;

            if (data.success) {
                setEvents(data.message);
            }
        }
        catch (error) {

        }
    }, [])


    const getNotiInWeek = useCallback(async (startTime, endTime) =>{
        try {
            const response = await appClient.get(`api/Events/date/${startTime}/${endTime}`);
            const data = response.data;

            if (data.success) {
                setNotiInWeek(data.message);
            }
        }
        catch (error) {

        }
    }, [])

    const sendNoti = async (scheduleEventId) =>{
        try{
            var response = await appClient.put(`api/events/${scheduleEventId}/send-noti`);
            var data = response.data;

            if(data.success){
                if(notiConnection != null){
                    await notiConnection.invoke("SendNotiToUserAsync");
                }
                console.log(notiConnection);
            }
        }
        catch{

        }
    }

    useEffect(() => {
        getScheduleEventsWithDate(currentDay.toLocaleDateString("en-CA"));

        getNotiInWeek(dayOfWeek.at(0),dayOfWeek.at(-1));
    }, [])

    useEffect(() => {
        setDayOfWeek(prev => {
            const daysSinceMonday = (currentDay.getDay() - 1 + 7) % 7;

            const lastMonday = new Date(currentDay);
            lastMonday.setDate(currentDay.getDate() - daysSinceMonday);

            var result = [];
            result.push(lastMonday.toISOString().split("T")[0]);

            for (let i = 0; i < 6; i++) {
                lastMonday.setDate(lastMonday.getDate() + 1);
                const lastMondayFormat = lastMonday.toISOString().split("T")[0];
                result.push(lastMondayFormat);
            }

            return result;
        })

        getScheduleEventsWithDate(currentDay.toLocaleDateString("en-CA"));
    }, [currentDay])

    useEffect(() =>{
        getNotiInWeek(dayOfWeek.at(0), dayOfWeek.at(-1));
    }, [dayOfWeek])

    useEffect(() =>{
        getNotiInWeek(dayOfWeek.at(0), dayOfWeek.at(-1));

        const isCurrentTimeInRange = ({date , startTime, endTime}) => {
            const now = new Date();

            const start = new Date(`${date} ${startTime}`);
            const end = new Date(`${date} ${endTime}`);
        
            start.setMinutes(start.getMinutes() - 5);
        
            return now >= start && now <= end;
        }

        events.forEach((item) =>{
            var isInTime = isCurrentTimeInRange(item);
            if(isInTime && item.isSend == false){
                sendNoti(item.scheduleId);
            }
        })

    }, [events])

    const handleNextCalendar = (e) => {
        setCurrentDay(prev => {
            const nextDay = new Date(prev);
            nextDay.setDate(prev.getDate() + 7);
            return nextDay;
        })


    }

    const handlePreviousCalendar = (e) => {
        setCurrentDay(prev => {
            const nextDay = new Date(prev);
            nextDay.setDate(prev.getDate() - 7);
            return nextDay;
        })
    }

    const handleSelectedDate = (e) => {
        setCurrentDay(prev => {
            const nextDate = new Date(prev);
            nextDate.setDate(e.target.innerHTML);
            return nextDate;
        })
    }

    const handleAddEvent = () => {
        getScheduleEventsWithDate(currentDay.toLocaleDateString("en-CA"));
    }

    const hanleRemoveEvent = (eventId) => {
        const submitDelete = async () => {
            try{
                var response = await appClient.delete(`api/events/${eventId}`);
                const data = response.data;

                if(data.success){
                    let newEvents = events.filter((item) => item.scheduleId !== eventId);
                    setEvents(newEvents);
                }
                
            }
            catch{
    
            }
        }

        submitDelete();
    }

    return (
        <div className='calendar-event__wrapper'>
            <div className='flex justify-between items-center'>
                <span className='ce__title'>{`${currentDay.toLocaleString('default', { month: 'long' })} ${currentDay.getFullYear()}`}</span>
                <div>
                    <button className='ce__btn-arrow' onClick={handlePreviousCalendar}>
                        <img src={IMG_URL_BASE + "left-arrow-icon.svg"} />
                    </button>
                    <button className='ce__btn-arrow ml-[4px]' onClick={handleNextCalendar}>
                        <img src={IMG_URL_BASE + "right-arrow-icon.svg"} />
                    </button>
                </div>
            </div>

            <div className='flex items-center justify-center'>
                {weekDay.map((item, index) => <span key={index} className='ce__weekday-item'>{item}</span>)}
            </div>

            <div className='flex items-center justify-center mb-[10px]'>
                {dayOfWeek.map((item, index) =>
                    <span key={index} className='ce__dayofweek-item'>
                        <div 
                            className={`ce__dayofweek-item--text ${currentDay.getDate() == item.slice(-2) ? " active" : ""} ${notiInWeek[index] ? " noti" : ""}`} 
                            onClick={(e) => handleSelectedDate(e)}>
                            {parseInt(item.slice(-2))}
                        </div>
                    </span>
                )}
            </div>

            <AddEvent onAddEvent={handleAddEvent} currentDate = {currentDay.toLocaleDateString("en-CA")} />

            <div className={`flex items-center mt-[10px] mb-[10px] ${events.length == 0 ? "hidden" : ""}`}>
                <span className='ae__add-event--title mr-[10px]'>Today</span>
                <div className='ae__seperate'></div>
            </div>

            <div className='max-h-[240px] overflow-auto'>
                {events.map((item, index) => {
                    return <EventItem key={index} itemInfo={item} onRemoveEvent={hanleRemoveEvent}/>
                })}
            </div>


        </div>
    )
}

export default CalendarEvent