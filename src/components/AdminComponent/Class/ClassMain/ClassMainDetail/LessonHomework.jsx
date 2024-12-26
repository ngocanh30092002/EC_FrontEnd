import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useParams } from 'react-router-dom';
import MaskedInput from 'react-text-mask';
import { appClient } from '~/AppConfigs';
import DropDownList from '../../../../CommonComponent/DropDownList';
import { APP_URL, IMG_URL_BASE } from '~/GlobalConstant.js';
import toast from '@/helper/Toast';
import SubmissionTasks from './SubmissionTasks';
import HomeworkList from './HomeworkList';
import LoaderPage from '../../../../LoaderComponent/LoaderPage';

function LessonHomework() {
    const { lessonId } = useParams();
    const [isShowBoard, setIsShowBoard] = useState(false);
    const [isShowTaskBroad, setIsShowTaskBroad] = useState(false);
    const [isShowEdit, setIsShowEdit] = useState(false);
    const [submissionTasks, setSubmissionTasks] = useState([]);
    const [homework, setHomework] = useState([]);

    const getHomeworks = async () => {
        try {
            const response = await appClient.get(`api/Homework/lessons/${lessonId}`);
            const data = await response.data;
            if (data.success) {
                setHomework(data.message);
            }
        }
        catch {

        }
    }

    useEffect(() => {
    }, [])


    const getSubmissionTasks = async () => {
        try {
            const response = await appClient.get(`api/SubmissionTasks/lessons/${lessonId}/all`);
            const data = response.data;
            if (data.success) {
                console.log(data.message);
                setSubmissionTasks(data.message);
            }
        }
        catch {

        }
    }

    const handleReloadTasks = () => {
        getSubmissionTasks();
    }

    const handleReloadHomework = () => {
        getHomeworks();
    }


    useEffect(() => {
        getHomeworks();
        getSubmissionTasks();
    }, [])

    const handleSetTaskBoard = (value) => {
        setIsShowTaskBroad(value);
        if (isShowBoard) {
            setIsShowBoard(false);
            setIsShowEdit(false);
        }
    }
    const handleSetBoard = (value) => {
        setIsShowBoard(value);
        if (isShowTaskBroad) {
            setIsShowTaskBroad(false);
            setIsShowEdit(false);
        }
    }

    const handleSetShowEdit = (value) => {
        setIsShowEdit(value);
        if (isShowTaskBroad) {
            setIsShowTaskBroad(false);
            setIsShowBoard(false);
        }
    }

    return (
        <div className='lh__wrapper overflow-visible flex flex-col'>
            <div className='flex justify-between px-[20px]'>
                <div className='lh__title'>Lesson Homework</div>

                <div className="flex items-center">
                    <button className='sp__add-schedule--btn mr-[10px]' onClick={(e) => handleSetTaskBoard(!isShowTaskBroad)}>
                        {
                            !isShowTaskBroad ?
                                "Add Task"
                                :
                                "Hide Board"
                        }

                    </button>

                    <button className='sp__add-schedule--btn mr-[10px]' onClick={(e) => handleSetBoard(!isShowBoard)}>
                        {
                            !isShowBoard ?
                                "Add Homework"
                                :
                                "Hide Board"
                        }

                    </button>

                    <button className='sp__add-schedule--btn' onClick={(e) => handleSetShowEdit(!isShowEdit)}>
                        {
                            !isShowEdit ?
                                "Edit lesson"
                                :
                                "Hide Board"
                        }

                    </button>
                </div>
            </div>

            {isShowBoard && <LessonHomeworkBoard lessonId={lessonId} onShowBoard={handleSetBoard} onReloadHomework={handleReloadHomework} />}
            {isShowTaskBroad && <SubmissionTaskBroad lessonId={lessonId} onShowTaskBoard={handleSetTaskBoard} onReloadTasks={handleReloadTasks} />}

            {isShowEdit && <LessonInfo lessonId={lessonId} />}
            <SubmissionTasks lessonId={lessonId} submissionTasks={submissionTasks} onReloadTasks={handleReloadTasks} />
            <HomeworkList lessonId={lessonId} homework={homework} onReloadHomework={handleReloadHomework} />
        </div>
    )
}

function LessonInfo({ lessonId }) {
    const [topic, setTopic] = useState("");
    const [lessonInfo, setLessonInfo] = useState(null);
    const [classRooms, setClassRooms] = useState([]);
    const [timePeriods, setTimePeriods] = useState([]);
    const [indexClassRoom, setIndexClassRoom] = useState();
    const [indexStart, setIndexStart] = useState();
    const [indexEnd, setIndexEnd] = useState();
    const [selectedClassRoom, setSelectedClassRoom] = useState(null);
    const [selectedStartPeriod, setSelectedStartPeriod] = useState(null);
    const [selectedEndPeriod, setSelectedEndPeriod] = useState(null);

    const [lessonDate, setLessonDate] = useState("");
    const convertDate = (date) => {
        const [month, day, year] = date.split('/');
        return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    };

    const topicRef = useRef(null);
    const getLessonInfo = async () => {
        try {
            const response = await appClient.get(`api/lessons/${lessonId}`);
            const dataRes = response.data;
            if (dataRes.success) {
                setLessonInfo(dataRes.message);
                setLessonDate(convertDate(dataRes.message.date))
                setTopic(dataRes.message.topic)
            }
        }
        catch {

        }
    }

    const getClassrooms = async () => {
        try {
            const response = await appClient.get(`api/ClassRooms`);
            const dataRes = response.data;
            if (dataRes.success) {
                setClassRooms(dataRes.message);
            }
        }
        catch {

        }
    }

    const getTimePeriod = async () => {
        try {
            const response = await appClient.get(`api/TimePeriod`);
            const dataRes = response.data;
            if (dataRes.success) {
                setTimePeriods(dataRes.message);
            }
        }
        catch {

        }
    }
    useEffect(() => {
        getLessonInfo();
        getClassrooms();
        getTimePeriod();
    }, [])

    useEffect(() => {
        if (lessonInfo) {
            if (classRooms.length != 0) {
                setIndexClassRoom(classRooms.findIndex(i => i.id == lessonInfo.classRoomId))
            }
            if (timePeriods) {
                setIndexStart(timePeriods.findIndex(i => i.periodId == lessonInfo.startPeriod))
                setIndexEnd(timePeriods.findIndex(i => i.periodId == lessonInfo.endPeriod))
            }
        }
    }, [lessonInfo])

    const handleReload = () => {
        getLessonInfo();
        getClassrooms();
        getTimePeriod();
    }


    const handleSubmitLessonInfo = async (event) => {
        event.preventDefault();
        const [year, month, day] = lessonDate.split("-");

        const formData = new FormData();
        formData.append("StartPeriod", selectedStartPeriod.value)
        formData.append("EndPeriod", selectedEndPeriod.value)
        formData.append("ClassRoomId", selectedClassRoom.value)
        formData.append("Date", `${month}/${day}/${year}`)
        formData.append("Topic", topicRef.current.value)
        formData.append("ClassId", lessonInfo?.classId)

        try {
            const response = await appClient.put(`api/Lessons/${lessonId}`, formData);
            const dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Success",
                    message: "Update lesson successfully",
                    duration: 4000
                });
            }
            else {
                handleReload();
            }
        }
        catch {

        }
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

    return (
        <div className='stb__wrapper w-full p-[20px] overflow-visible'>
            <form className='h-full overflow-visible p-[20px] border rounded-[10px]' onSubmit={handleSubmitLessonInfo}>
                <div className="flex items-center overflow-visible">
                    <div className='flex items-center flex-1'>
                        <div className='li__title-text'>Topic: </div>
                        <input
                            className={`flex-1 li__input`}
                            name='Topic'
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            ref={topicRef} />
                    </div>

                    <div className='flex items-center flex-1 overflow-visible'>
                        <div className='li__title-text'>Classroom: </div>
                        <DropDownList
                            data={classRooms?.map((item, index) => ({ key: item.classRoomName, value: item.id }))}
                            defaultIndex={indexClassRoom}
                            className={`li__input`}
                            onSelectedItem={handleSelectedClassRoom}
                            name={"ClassRoomId"}
                        />
                    </div>

                </div>

                <div className='flex items-center mt-[20px] overflow-visible'>
                    <div className='flex-1 flex items-center overflow-visible'>
                        <div className='li__title-text'>Start Period: </div>
                        <DropDownList
                            data={timePeriods?.map((item, index) => ({ key: item.startTime, value: item.periodId }))}
                            defaultIndex={indexStart}
                            className={`li__input`}
                            name={"StartPeriod"}
                            onSelectedItem={handleSelectedStartPeriod}
                        />
                    </div>
                    <div className='flex-1 flex items-center overflow-visible'>
                        <div className='li__title-text'>End Period: </div>
                        <DropDownList
                            data={timePeriods?.map((item, index) => ({ key: item.endTime, value: item.periodId }))}
                            defaultIndex={indexEnd}
                            className={`li__input`}
                            name={"EndPeriod"}
                            onSelectedItem={handleSelectedEndPeriod}
                        />
                    </div>
                </div>

                <div className='flex items-center mt-[20px]'>
                    <div className='flex-1 flex items-center'>
                        <div className="li__title-text">Date</div>
                        <input type='date' name='Date' className={`flex-1 li__input `} value={lessonDate} onChange={(event) => setLessonDate(event.target.value)} />
                    </div>
                    <div className='flex justify-end flex-1'>
                        <button className='qi__btn-func' type='submit'> Save </button>
                    </div>
                </div>
            </form>
        </div>
    )
}

function SubmissionTaskBroad({ lessonId, onShowTaskBoard, onReloadTasks }) {
    const [startDate, setStartDate] = useState(() => {
        const now = new Date();
        const offsetDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
        const formattedDateTime = offsetDateTime.toISOString().slice(0, 16);
        return formattedDateTime;
    })
    const [endDate, setEndDate] = useState(() => {
        const now = new Date();
        now.setHours(23, 59, 59, 999);
        const localEndOfDay = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
        const formattedEndOfDay = localEndOfDay.toISOString().slice(0, 16);

        return formattedEndOfDay;
    })

    const inputTitleRef = useRef(null);
    const inputEndTimeRef = useRef(null);
    const inputStartTimeRef = useRef(null);
    const areaDesRef = useRef(null);

    const handleClearInput = () => {
        inputTitleRef.current.value = "";
        inputEndTimeRef.current.value = "";
        inputStartTimeRef.current.value = "";
        areaDesRef.current.value = "";
    }

    const handleSubmitTask = async () => {
        try {
            if (inputTitleRef.current && (inputTitleRef.current.value == null || inputTitleRef.current.value == "")) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Title is required",
                    duration: 4000
                });

                inputTitleRef.current.classList.toggle("error")

                setTimeout(() => {
                    inputTitleRef.current.classList.toggle("error")
                }, (2000));
                return;
            }

            const startTime = new Date(startDate);
            const endTime = new Date(endDate);

            if (startTime.getTime() > endTime.getTime()) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Start date must be less than End date",
                    duration: 4000
                });

                inputStartTimeRef.current.classList.toggle("error")

                setTimeout(() => {
                    inputStartTimeRef.current.classList.toggle("error")
                }, (2000));

                return;
            }

            if (startTime.getTime() == endTime.getTime()) {
                toast({
                    type: "warning",
                    title: "Warning",
                    message: "Users need some time to submit their work.",
                    duration: 4000
                });

                return;
            }

            const formData = new FormData();
            formData.append("LessonId", lessonId);
            formData.append("Title", inputTitleRef.current.value);
            formData.append("StartTime", startDate);
            formData.append("EndTime", endDate);

            if (areaDesRef.current.value) {
                formData.append("Description", areaDesRef.current.value);
            }

            const response = await appClient.post("api/SubmissionTasks", formData);
            const data = response.data;
            if (data.success) {
                toast({
                    type: "success",
                    title: "Success",
                    message: "Create task successfully",
                    duration: 4000
                });

                handleClearInput();
                onShowTaskBoard(false);
                onReloadTasks();
            }
        }
        catch (err) {
            toast({
                type: "error",
                title: "ERROR",
                message: err.message,
                duration: 4000
            });
        }
    }

    return (
        <div className='stb__wrapper p-[20px] overflow-visible '>
            <div className='border  p-[20px] rounded-[10px]'>
                <div className="flex items-center">
                    <div className='stb__header-name'>Title:</div>
                    <input ref={inputTitleRef} className='stb__input flex-1' />
                </div>
                <div className='flex items-center mt-[20px]'>
                    <div className="flex-1 flex items-center">
                        <div className='stb__header-name'>Start Time:</div>
                        <input
                            ref={inputStartTimeRef}
                            className='stb__input'
                            type="datetime-local"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                        />
                    </div>
                    <div className="flex-1 flex items-center">
                        <div className='stb__header-name'>End Time:</div>
                        <input
                            ref={inputEndTimeRef}
                            className='stb__input'
                            type="datetime-local"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                        />
                    </div>
                </div>
                <div className='flex mt-[20px] justify-start'>
                    <div className='stb__header-name'>Description: </div>
                    <textarea rows={6} ref={areaDesRef} className='stb__input-area w-full' />
                </div>

                <div className="flex justify-end mt-[20px]">
                    <button className='sab__btn-func' onClick={handleSubmitTask}>Add now</button>
                </div>
            </div>
        </div>
    )
}

function LessonHomeworkBoard({ onShowBoard, lessonId, onReloadHomework }) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedQues, setSelectedQues] = useState(() => {
        return Array.from({ length: 7 }).reduce((acc, _, i) => {
            acc[i + 1] = [];
            return acc;
        }, {});
    });
    const [fileImageName, setFileImageName] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedType, setSelectedType] = useState(null);
    const [selectedQuesId, setSelectedQuesId] = useState(null);
    const [defaultQues, setDefaultQues] = useState(-1);
    const [defaultType, setDefaultType] = useState(-1);

    const [listQues, setListQues] = useState([]);
    const [queTypes, setQueTypes] = useState([]);
    const [selectedStandard, setSelectedStandard] = useState(0);
    const [startDate, setStartDate] = useState(() => {
        const now = new Date();
        const offsetDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
        const formattedDateTime = offsetDateTime.toISOString().slice(0, 16);
        return formattedDateTime;
    })
    const [endDate, setEndDate] = useState(() => {
        const now = new Date();
        now.setHours(23, 59, 59, 999);
        const localEndOfDay = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
        const formattedEndOfDay = localEndOfDay.toISOString().slice(0, 16);

        return formattedEndOfDay;
    })

    const inputTitleRef = useRef(null);
    const inputFileRef = useRef(null);
    const inputStartRef = useRef(null);
    const inputEndRef = useRef(null);
    const inputDaysRef = useRef(null);
    const inputPassRate = useRef(null);
    const inputTimeRef = useRef(null);
    const inputExpectedTimeRef = useRef(null);
    const toeicStandardRef = useRef();

    const isValidTime = (time) => {
        const [hours, minutes, seconds] = time.split(':').map(Number);
        return (
            hours >= 0 && hours <= 23 &&
            minutes >= 0 && minutes <= 59 &&
            seconds >= 0 && seconds <= 59
        );
    };

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

    const handleChangeFile = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            setFileImageName(file.name);
        }
    }

    const handleChangeLateSubmit = (event) => {
        if (inputDaysRef.current) {
            inputDaysRef.current.value = event.target.value.replace(/[^0-9]/g, '');
        }
    }

    const handleChangePassRate = (event) => {
        const value = event.target.value.replace(/[^0-9]/g, '');
        const numericValue = parseInt(value, 10);

        if (numericValue >= 0 && numericValue <= 100) {
            if (inputPassRate.current) {
                inputPassRate.current.value = numericValue;
            }
        } else {
            if (inputPassRate.current) {
                inputPassRate.current.value = '';
            }
        }
    }

    const getQuesTypes = async () => {
        try {
            const response = await appClient.get("api/HomeQues/types");
            const dataRes = response.data;
            if (dataRes.success) {
                setQueTypes(dataRes.message);
            }
        }
        catch {

        }
    }

    const handleSelectedQuesType = (item, index) => {
        if (item) {
            setSelectedType(item.value);
        }
        else {
            setSelectedType(null);
        }

        setDefaultType(index);
        setDefaultQues(-1);
        setSelectedQuesId(null);
    }

    useEffect(() => {
        getQuesTypes();
    }, [])

    const getListQuestions = async () => {
        try {
            let apiQuestions = undefined;

            switch (selectedType) {
                case 1:
                    apiQuestions = "api/lc-images";
                    break;
                case 2:
                    apiQuestions = "api/lc-audios";
                    break;
                case 3:
                    apiQuestions = "api/lc-con";
                    break;
                case 4:
                    apiQuestions = "api/rc-sentence"
                    break;
                case 5:
                    apiQuestions = "api/rc-single"
                    break;
                case 6:
                    apiQuestions = "api/rc-double"
                    break;
                case 7:
                    apiQuestions = "api/rc-triple"
                    break;
            }

            const response = await appClient.get(apiQuestions);
            const dataRes = response.data;

            if (dataRes.success) {
                setListQues(dataRes.message);
            }
        }
        catch {

        }
    }

    const handleSelectQuesId = (item, index) => {
        if (item) {
            setSelectedQuesId(item.value)
        }
        else {
            setSelectedQuesId(null);
        }

        setDefaultQues(index);
    }

    useEffect(() => {
        if (selectedType != null) {
            getListQuestions();
        }
    }, [selectedType])

    const timeMask = [/\d/, /\d/, ':', /\d/, /\d/, ':', /\d/, /\d/];

    const handleAddQues = (event) => {
        event.preventDefault();
        setSelectedQues(prev => {
            if (selectedQuesId != null) {
                const length = prev[selectedType] ? prev[selectedType].length : 0;
                if (prev[selectedType]) {
                    prev[selectedType] = prev[selectedType].filter(i => i !== selectedQuesId);

                    let isValid = true;
                    if (selectedType == 1 && prev[selectedType].length >= 6) {
                        isValid = false;
                    }
                    if (selectedType == 2 && prev[selectedType].length >= 25) {
                        isValid = false;
                    }
                    if (selectedType == 3 && prev[selectedType].length >= 13) {
                        isValid = false;
                    }
                    if (selectedType == 4 && prev[selectedType].length >= 10) {
                        isValid = false;
                    }
                    if (selectedType == 5 && prev[selectedType].length >= 30) {
                        isValid = false;
                    }
                    if (selectedType == 6 && prev[selectedType].length >= 4) {
                        isValid = false;
                    }
                    if (selectedType == 7 && prev[selectedType].length >= 15) {
                        isValid = false;
                    }

                    if (isValid == false) {
                        toast({
                            type: "error",
                            title: "Success",
                            message: `Part ${selectedType} is full and cannot be added.`,
                            duration: 4000
                        })

                        return prev;
                    }


                    prev[selectedType].push(selectedQuesId);
                }
                else {
                    prev[selectedType] = [selectedQuesId];
                }

                const lengthAfter = prev[selectedType] ? prev[selectedType].length : 0;

                if (length !== lengthAfter) {
                    if (inputExpectedTimeRef.current) {
                        const selectedQues = listQues.find(i => i.id == selectedQuesId);
                        const inputValue = inputExpectedTimeRef.current.value;
                        const totalTime = timeToSeconds(inputValue == "" ? "00:00:00" : inputValue) + timeToSeconds(selectedQues.time);
                        inputExpectedTimeRef.current.value = secondsToTime(totalTime);
                    }
                }
            }
            return { ...prev }
        });
    }

    const handleDeleteQues = (event) => {
        event.preventDefault();
        setSelectedQues(prev => {
            if (selectedQuesId != null) {
                const length = prev[selectedType] ? prev[selectedType].length : 0;

                if (prev[selectedType]) {
                    prev[selectedType] = prev[selectedType].filter(i => i !== selectedQuesId);
                }

                const lengthAfter = prev[selectedType] ? prev[selectedType].length : 0;

                if (length !== lengthAfter) {
                    if (inputExpectedTimeRef.current) {
                        const selectedQues = listQues.find(i => i.id == selectedQuesId);
                        const inputValue = inputExpectedTimeRef.current.value;
                        let totalTime = timeToSeconds(inputValue == "" ? "00:00:00" : inputValue) - timeToSeconds(selectedQues.time);

                        inputExpectedTimeRef.current.value = secondsToTime(totalTime < 0 ? 0 : totalTime);
                    }
                }

            }
            return { ...prev }
        });
    }

    const handleClearInput = () => {
        inputTitleRef.current.value = "";
        setSelectedFile(null);
        setFileImageName("");
        setStartDate(prev => {
            const now = new Date();
            const offsetDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
            const formattedDateTime = offsetDateTime.toISOString().slice(0, 16);
            return formattedDateTime;
        })

        setEndDate(prev => {
            const now = new Date();
            now.setHours(23, 59, 59, 999);
            const localEndOfDay = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
            const formattedEndOfDay = localEndOfDay.toISOString().slice(0, 16);
            return formattedEndOfDay;
        })

        inputDaysRef.current.value = "";
        inputPassRate.current.value = "";
        setDefaultType(-1);
        setDefaultQues(-1);

        if (inputExpectedTimeRef.current) {
            inputExpectedTimeRef.current.value = ""
        }

        if (inputTimeRef.current) {
            inputTimeRef.current.inputElement.value = ""
        }

        setSelectedQues(() => {
            return Array.from({ length: 7 }).reduce((acc, _, i) => {
                acc[i + 1] = [];
                return acc;
            }, {});
        })
    }

    const handleSubmitHomework = async (event) => {
        event.preventDefault();

        try {
            if (inputTitleRef.current && (inputTitleRef.current.value == "" || inputTitleRef.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Title is required",
                    duration: 4000
                })

                inputTitleRef.current.classList.toggle("cabf__input--error");
                inputTitleRef.current.focus();

                setTimeout(() => {
                    inputTitleRef.current.classList.toggle("cabf__input--error");
                }, 2000);

                return;
            }

            if (inputDaysRef.current && (inputDaysRef.current.value == "" || inputDaysRef.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Late day is required",
                    duration: 4000
                })

                inputDaysRef.current.classList.toggle("cabf__input--error");
                inputDaysRef.current.focus();

                setTimeout(() => {
                    inputDaysRef.current.classList.toggle("cabf__input--error");
                }, 2000);

                return;
            }

            if (inputPassRate.current && (inputPassRate.current.value == "" || inputPassRate.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Pass rate is required",
                    duration: 4000
                })

                inputPassRate.current.classList.toggle("cabf__input--error");
                inputPassRate.current.focus();

                setTimeout(() => {
                    inputPassRate.current.classList.toggle("cabf__input--error");
                }, 2000);

                return;
            }

            if(selectedFile == null){
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Image is required",
                    duration: 4000
                })

                return;
            }

            if (selectedStandard == 0) {
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
            }

            const startTime = new Date(startDate);
            const endTime = new Date(endDate);

            if (startTime.getTime() > endTime.getTime()) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Start date must be less than End date",
                    duration: 4000
                });

                inputStartRef.current.classList.toggle("error")

                setTimeout(() => {
                    inputStartRef.current.classList.toggle("error")
                }, (2000));

                return;
            }

            if (startTime.getTime() == endTime.getTime()) {
                toast({
                    type: "warning",
                    title: "Warning",
                    message: "Users need some time to submit their work.",
                    duration: 4000
                });

                return;
            }

            setIsLoading(true);

            const formData = new FormData(event.target);
            formData.append("LessonId", lessonId);
            formData.append("StartTime", startDate);
            formData.append("EndTime", endDate);

            if (selectedStandard == 1) {
                formData.append("Type", 2);
            }

            let response = await appClient.post("api/homework", formData);
            let dataRes = response.data;
            if (dataRes.success && selectedStandard == 0) {
                const homeworkId = dataRes.message
                const formDataHomeQues = new FormData();

                Object.keys(selectedQues).forEach((key, index) => {
                    formDataHomeQues.append(`listModels[${index}].Type`, key);

                    selectedQues[key].forEach((item, indexQue) => {
                        formDataHomeQues.append(`listModels[${index}].QueIds[${indexQue}]`, item);
                    })
                })

                response = await appClient.post(`api/HomeQues/homework/${homeworkId}`, formDataHomeQues);
                dataRes = response.data;
                if (dataRes.success) {
                    onShowBoard(false);
                    handleClearInput();
                    onReloadHomework();

                    toast({
                        type: "success",
                        title: "Success",
                        message: "Create homework successfully",
                        duration: 4000
                    });
                }
            }
            if (dataRes.success && selectedStandard == 1) {
                const homeworkId = dataRes.message
                const quesDataForm = toeicStandardRef.current.getFormData();

                response = await appClient.post(`api/RandomQues/homework/${homeworkId}/random/list`, quesDataForm);
                dataRes = response.data;
                if (dataRes.success) {
                    onShowBoard(false);
                    handleClearInput();
                    onReloadHomework();

                    toast({
                        type: "success",
                        title: "Success",
                        message: "Create homework successfully",
                        duration: 4000
                    });
                }
            }

            setIsLoading(false);
        }
        catch (err) {
            setIsLoading(false);
        }

    }

    return (

        <>
            {isLoading && <LoaderPage/>}
            <form className='lhb__wrapper min-h-[910px] w-full p-[20px] overflow-visible' method='POST' onSubmit={handleSubmitHomework}>
                <div className='flex'>
                    <div className='flex items-center flex-1'>
                        <div className="lbh__title-text">Title</div>
                        <input
                            type="text"
                            className="lbh__input"
                            name='Title'
                            placeholder='Enter your title'
                            ref={inputTitleRef}
                        />
                    </div>

                    <div className='flex items-center flex-1'>
                        <div className="lbh__title-text">Image</div>
                        <input type='file' accept='image/*' className='hidden' name='Image' ref={inputFileRef} onChange={handleChangeFile} />
                        <input
                            type="text"
                            className="lbh__input cursor-pointer"
                            placeholder='Upload file image'
                            value={fileImageName}
                            readOnly
                            onClick={(e) => inputFileRef.current.click()}
                        />
                    </div>
                </div>

                <div className='flex mt-[20px]'>
                    <div className='flex items-center flex-1'>
                        <div className="lbh__title-text">Start Date</div>
                        <input
                            type="datetime-local"
                            className="lbh__input"
                            name='StartDate'
                            value={startDate}
                            ref={inputStartRef}
                            onChange={(e) => setStartDate(e.target.value)}
                            placeholder='Enter your title'
                        />
                    </div>

                    <div className='flex items-center flex-1'>
                        <div className="lbh__title-text">End Date</div>
                        <input
                            type="datetime-local"
                            className="lbh__input"
                            value={endDate}
                            ref={inputEndRef}
                            onChange={(e) => setEndDate(e.target.value)}
                            name='EndDate'
                            placeholder='Enter your title'
                        />
                    </div>
                </div>

                <div className='flex mt-[20px]'>
                    <div className='flex items-center flex-1'>
                        <div className="lbh__title-text">Late Days</div>
                        <input
                            className="lbh__input"
                            name='LateSubmitDays'
                            placeholder='Enter late submit days...'
                            onChange={handleChangeLateSubmit}
                            ref={inputDaysRef}
                        />
                    </div>

                    <div className='flex items-center flex-1'>
                        <div className="lbh__title-text">Pass Rate</div>
                        <input
                            className="lbh__input"
                            name='Achieved_Percentage'
                            placeholder='Enter pass rate...'
                            onChange={handleChangePassRate}
                            ref={inputPassRate}
                        />
                    </div>
                </div>

                <div className='flex mt-[20px]'>
                    <div className="lbh__title-text">Standard</div>
                    <div className='flex items-center justify-center flex-1'>
                        <input type='radio' name='standard' id='Normal' className='lbh__rdo' checked={selectedStandard == 0} onChange={(e) => setSelectedStandard(0)} />
                        <label htmlFor='Normal' className='lbh__label'>Normal</label>
                    </div>
                    <div className='flex items-center justify-center flex-1'>
                        <input type='radio' id='Toeic' name='standard' className='lbh__rdo' checked={selectedStandard == 1} onChange={(e) => setSelectedStandard(1)} />
                        <label htmlFor='Toeic' className='lbh__label'>TOEIC</label>
                    </div>
                </div>

                {
                    selectedStandard == 0 &&
                    <div className='flex mt-[20px]'>
                        <div className='flex items-center flex-1'>
                            <div className="lbh__title-text">Expected Time</div>
                            <input
                                type='text'
                                className="lbh__input"
                                readOnly
                                ref={inputExpectedTimeRef}
                            />
                        </div>

                        <div className='flex items-center flex-1'>
                            <div className="lbh__title-text">Time</div>
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
                }



                {
                    selectedStandard == 0 ?
                        <>
                            <div className='flex mt-[20px] overflow-visible'>
                                <div className='flex items-center overflow-visible flex-1'>
                                    <div className="lbh__title-text">Question Type</div>
                                    <DropDownList data={queTypes} defaultIndex={defaultType} className={"border !rounded-[20px]"} placeholder={"Select question type..."} onSelectedItem={handleSelectedQuesType} />
                                </div>

                                {selectedType != null ?
                                    <div className='flex items-center overflow-visible flex-1'>
                                        <div className="lbh__title-text">Question Id </div>
                                        <DropDownList data={listQues.map((item, index) => ({ key: item.id, value: item.id }))} defaultIndex={defaultQues} className={"border !rounded-[20px] pt-0"} placeholder={"Select question id..."} onSelectedItem={handleSelectQuesId} />
                                    </div>
                                    :
                                    <div className='flex-1'></div>
                                }

                            </div>

                            {selectedType != null &&
                                <>
                                    <div className='flex items-center justify-between mt-[20px] border'>
                                        {
                                            Object.keys(selectedQues).map((key, index) => {
                                                let typeName = undefined;
                                                if (key == 1) {
                                                    typeName = "Image";
                                                }
                                                else if (key == 2) {
                                                    typeName = "Audio";
                                                }
                                                else if (key == 3) {
                                                    typeName = "Conversation";
                                                }
                                                else if (key == 4) {
                                                    typeName = "Sentence";
                                                }
                                                else if (key == 5) {
                                                    typeName = "Single";
                                                }
                                                else if (key == 6) {
                                                    typeName = "Double";
                                                }
                                                else {
                                                    typeName = "Triple"
                                                }

                                                return (
                                                    <div className='flex items-center sq__wrapper' key={index}>
                                                        <div className='sq__type-name'>{typeName}:</div>
                                                        <div className='sq__num'>{selectedQues[key].length}</div>
                                                    </div>
                                                )
                                            })
                                        }
                                    </div>

                                    <div className='flex items-center justify-between mt-[20px] mb-[20px]'>
                                        <div className='flex justify-end'>
                                            <div className='qi__btn-func delete' onClick={(event) => handleDeleteQues(event)}>Undo</div>
                                            <div className='qi__btn-func' onClick={(event) => handleAddQues(event)}>Add</div>
                                        </div>
                                        <div>
                                            {
                                                selectedQues[selectedType].includes(selectedQuesId) &&
                                                <div className='qi__selected--text'>
                                                    Selected
                                                </div>
                                            }
                                        </div>
                                        <div>
                                            <button className='qi__btn-func !w-[200px]' type='submit'>Submit Homework</button>
                                        </div>
                                    </div>

                                    {selectedType != null && selectedQuesId != null &&
                                        <QuestionInfo
                                            listQues={listQues}
                                            quesId={selectedQuesId}
                                            type={selectedType}
                                        />
                                    }
                                </>
                            }
                        </>
                        :
                        <div className='mt-[20px]'>
                            <QuestionToeicStandard ref={toeicStandardRef} />
                            <div className="flex justify-end mt-[20px]">
                                <button type='submit' className='qi__btn-func !w-[200px]'>Submit Homework</button>
                            </div>
                        </div>
                }
            </form>
        </>
    )
}

export const QuestionToeicStandard = forwardRef((props, ref) => {
    const formQuesRef = useRef(null);
    const btnRef = useRef(null);
    const dataParts = [
        {
            title: "Part 1",
            number: 6
        },
        {
            title: "Part 2",
            number: 25
        },
        {
            title: "Part 3",
            number: 13
        },
        {
            title: "Part 4",
            number: 10
        },
        {
            title: "Part 5",
            number: 30
        },
        {
            title: "Part 6",
            number: 4
        },
        {
            title: "Part 7",
            number: 15
        },
    ]

    const handleBlurInput = (event) => {
        const parentWrapper = event.target.closest('.rdo__row__wrapper');
        const inputs = parentWrapper.querySelectorAll('.rdo__row-input');
        const lastInput = inputs[inputs.length - 1];
        const eventNum = event.target.value == "" ? 0 : parseInt(event.target.value);

        let total = 0;
        inputs.forEach(input => {
            if (input !== event.target && input !== lastInput) {
                total += parseInt(input.value) || 0;
            }
        });

        const remainingValue = lastInput.defaultValue - total;
        if (remainingValue - eventNum < 0) {
            event.target.value = '';
            lastInput.value = remainingValue;
            return;
        }

        lastInput.value = remainingValue - eventNum;
    }

    const handleChangeInput = (event) => {
        event.target.value = event.target.value.replace(/[^0-9]/g, '');
    }

    const handleSubmitForm = (event) => {
        if (event) event.preventDefault();
        const formData = new FormData();
        const inputs = formQuesRef.current.querySelectorAll("input");

        inputs.forEach((input, index) => {
            if (input.name) {
                formData.append(input.name, input.value == "" ? 0 : input.value);
            }
        });

        return formData;
    }

    useImperativeHandle(ref, () => ({
        getFormData: () => {
            return handleSubmitForm();
        }
    }))

    return (
        <div className='qts__wrapper '>
            <div className='rdq__tbl' ref={formQuesRef}>
                <div className="rdq__header__wrapper flex">
                    <div className="rdq__header !border-l-0"></div>
                    <div className="rdq__header ">Easy</div>
                    <div className="rdq__header">Intermediate</div>
                    <div className="rdq__header">Hard</div>
                    <div className="rdq__header">Very Hard</div>
                    <div className="rdq__header">Max</div>
                </div>

                <div className="rdo__body">
                    {
                        dataParts.map((item, index) => {
                            return (
                                <div className="rdo__row__wrapper flex w-full" key={index}>
                                    <div className='rdo__row-part-name  flex-1'>
                                        {item.title}
                                        <input className='hidden' name={`models[${index}].Part`} readOnly defaultValue={index + 1} />
                                    </div>
                                    <div className='flex-1 border border-t-0 border-r-0 border-[#cccccc]'>
                                        <input className='rdo__row-input' name={`models[${index}].NumNormal`} onChange={handleChangeInput} onBlur={handleBlurInput} />
                                    </div>
                                    <div className='flex-1 border border-t-0 border-r-0 border-[#cccccc]'>
                                        <input className='rdo__row-input' name={`models[${index}].NumIntermediate`} onChange={handleChangeInput} onBlur={handleBlurInput} />
                                    </div>
                                    <div className='flex-1 border border-t-0 border-r-0 border-[#cccccc]'>
                                        <input className='rdo__row-input' name={`models[${index}].NumHard`} onChange={handleChangeInput} onBlur={handleBlurInput} />
                                    </div>
                                    <div className='flex-1 border border-t-0 border-r-0 border-[#cccccc]'>
                                        <input className='rdo__row-input' name={`models[${index}].NumVeryHard`} onChange={handleChangeInput} onBlur={handleBlurInput} />
                                    </div>
                                    <div className='flex-1 border border-t-0 border-r-0 border-[#cccccc]'>
                                        <input className='rdo__row-input' readOnly defaultValue={item.number} />
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>

                <button type='button' onClick={handleSubmitForm} ref={btnRef} className='hidden'>Click</button>
            </div>
        </div>
    )
})

export function QuestionInfo({ listQues, type, quesId }) {
    const [queInfo, setQueInfo] = useState(() => {
        return listQues.find(q => q.id == quesId);
    })

    useEffect(() => {
        setQueInfo(listQues.find(q => q.id == quesId));
    }, [listQues, quesId])



    return (
        <div className=''>

            {type == 1 && queInfo != null && <QuestionImage queInfo={queInfo} />}
            {type == 2 && queInfo != null && <QuestionAudio queInfo={queInfo} />}
            {type == 3 && queInfo != null && <QuestionConversation queInfo={queInfo} />}
            {type == 4 && queInfo != null && <QuestionSentence queInfo={queInfo} />}
            {type == 5 && queInfo != null && <QuestionSingle queInfo={queInfo} />}
            {type == 6 && queInfo != null && <QuestionDouble queInfo={queInfo} />}
            {type == 7 && queInfo != null && <QuestionTriple queInfo={queInfo} />}
        </div>
    )
}

export function QuestionImage({ queInfo }) {
    const answerInfo = queInfo.answerInfo;
    const audioRef = useRef(null);
    const [selectedAnswer, setSelectedAnswer] = useState(queInfo.answerInfo.correctAnswer);

    useEffect(() => {
        setSelectedAnswer(queInfo.answerInfo.correctAnswer);
    }, [queInfo])

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.load();
        }
    }, [queInfo.audioUrl]);

    return (
        <div className='grid grid-cols-12 h-[320px] gap-[20px] p-[20px]'>
            <div className='col-span-5'>
                <img src={APP_URL + queInfo.imageUrl} className='w-full h-full object-cover rounded-[8px]' />
            </div>
            <div className='col-span-7 flex flex-col'>
                {Object.keys(answerInfo).filter((key) => key.startsWith("answer"))
                    .map((key, index) => (
                        <div className='flex items-center qa__wrapper' key={index}>
                            <input type='radio' name='answerRdo' disabled checked={key.replace("answer", "") == selectedAnswer} className='qa__rdo mr-[10px]' />
                            <div className='qi__title-text'>{key.replace("answer", "")}</div>
                            <div className='qi__ques-info'>{queInfo.answerInfo[key]}</div>
                        </div>
                    ))}

                <div className='flex justify-start flex-1 items-center mt-[20px]'>
                    <audio controls preload='auto' className='' ref={audioRef}>
                        <source src={APP_URL + queInfo.audioUrl} type="audio/mpeg" />
                    </audio>
                </div>
            </div>
        </div>
    )
}

export function QuestionAudio({ queInfo }) {
    const [selectedAnswer, setSelectedAnswer] = useState(queInfo.answerInfo.correctAnswer);

    useEffect(() => {
        setSelectedAnswer(queInfo.answerInfo.correctAnswer);
    }, [queInfo])

    const audioRef = useRef(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.load();
        }
    }, [queInfo.audioUrl]);

    return (
        <div className='flex p-[20px] flex-col'>
            <div className='flex items-center'>
                <div className='qa__title-text !font-bold'>Question: </div>
                <div className='qa__ques-info !font-bold'>{queInfo?.question}</div>
            </div>

            <div className='flex items-center qa__wrapper'>
                <input type='radio' name='answerRdo' disabled checked={selectedAnswer == "A"} className='qa__rdo mr-[10px]' />
                <div className='qa__title-text'>A </div>
                <div className='qa__ques-info'>{queInfo?.answerA}</div>
            </div>

            <div className='flex items-center qa__wrapper'>
                <input type='radio' name='answerRdo' disabled checked={selectedAnswer == "B"} className='qa__rdo mr-[10px]' />
                <div className='qa__title-text'>B </div>
                <div className='qa__ques-info'>{queInfo?.answerB}</div>
            </div>

            <div className='flex items-center qa__wrapper'>
                <input type='radio' name='answerRdo' disabled checked={selectedAnswer == "C"} className='qa__rdo mr-[10px]' />
                <div className='qa__title-text'>C </div>
                <div className='qa__ques-info'>{queInfo?.answerC}</div>
            </div>


            <div className='flex justify-start items-center mt-[20px]'>
                <audio controls preload='auto' ref={audioRef}>
                    <source src={APP_URL + queInfo?.audioUrl} type="audio/mpeg" />
                </audio>
            </div>
        </div>
    )
}

export function QuestionConversation({ queInfo }) {
    const audioRef = useRef(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.load();
        }
    }, [queInfo.audioUrl]);

    return (
        <div className='flex p-[20px] flex-col'>
            <div className='grid grid-cols-2 gap-[20px]'>
                {
                    queInfo.imageUrl != "" &&
                    <div className='flex justify-center'>
                        <img src={APP_URL + queInfo?.imageUrl} className='w-[250px] object-cover rounded-[8px]' />
                    </div>
                }

                {queInfo?.questions?.map((item, index) => {
                    return (
                        <div key={index} className="mt-[10px]">
                            <div className='flex items-start'>
                                <div className='qa__title-text !font-bold'>Question: {index + 1} </div>
                                <div className='qa__ques-info !font-bold !py-0'>{item?.question}</div>
                            </div>

                            <div className='flex items-center qa__wrapper'>
                                <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "A"} className='qa__rdo mr-[10px]' />
                                <div className='qa__title-text'>A </div>
                                <div className='qa__ques-info'>{item?.answerA}</div>
                            </div>

                            <div className='flex items-center qa__wrapper'>
                                <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "B"} className='qa__rdo mr-[10px]' />
                                <div className='qa__title-text'>B </div>
                                <div className='qa__ques-info'>{item?.answerB}</div>
                            </div>

                            <div className='flex items-center qa__wrapper'>
                                <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "C"} className='qa__rdo mr-[10px]' />
                                <div className='qa__title-text'>C </div>
                                <div className='qa__ques-info'>{item?.answerC}</div>
                            </div>

                            <div className='flex items-center qa__wrapper'>
                                <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "D"} className='qa__rdo mr-[10px]' />
                                <div className='qa__title-text'>D </div>
                                <div className='qa__ques-info'>{item?.answerD}</div>
                            </div>
                        </div>
                    )
                })}

            </div>

            <div className='flex justify-start items-center mt-[20px]'>
                <audio controls preload='auto' ref={audioRef}>
                    <source src={APP_URL + queInfo?.audioUrl} type="audio/mpeg" />
                </audio>
            </div>
        </div>
    )
}

export function QuestionSentence({ queInfo }) {
    const [selectedAnswer, setSelectedAnswer] = useState(queInfo.answerInfo.correctAnswer);

    useEffect(() => {
        setSelectedAnswer(queInfo.answerInfo.correctAnswer);
    }, [queInfo])

    return (
        <div className='flex p-[20px] flex-col'>
            <div className='flex items-center qa__wrapper'>
                <div className='qa__title-text !font-bold'>Question: </div>
                <div className='qa__ques-info !font-bold'>{queInfo?.question}</div>
            </div>

            <div className='flex items-center qa__wrapper'>
                <input type='radio' name='answerRdo' disabled checked={selectedAnswer == "A"} className='qa__rdo mr-[10px]' />
                <div className='qa__title-text'>A </div>
                <div className='qa__ques-info'>{queInfo?.answerA}</div>
            </div>

            <div className='flex items-center qa__wrapper'>
                <input type='radio' name='answerRdo' disabled checked={selectedAnswer == "B"} className='qa__rdo mr-[10px]' />
                <div className='qa__title-text'>B </div>
                <div className='qa__ques-info'>{queInfo?.answerB}</div>
            </div>

            <div className='flex items-center qa__wrapper'>
                <input type='radio' name='answerRdo' disabled checked={selectedAnswer == "C"} className='qa__rdo mr-[10px]' />
                <div className='qa__title-text'>C </div>
                <div className='qa__ques-info'>{queInfo?.answerC}</div>
            </div>

            <div className='flex items-center qa__wrapper'>
                <input type='radio' name='answerRdo' disabled checked={selectedAnswer == "D"} className='qa__rdo mr-[10px]' />
                <div className='qa__title-text'>D </div>
                <div className='qa__ques-info'>{queInfo?.answerD}</div>
            </div>
        </div>
    )
}

export function QuestionSingle({ queInfo }) {
    return (
        <div className='flex p-[20px] flex-col'>
            <div className='grid grid-cols-2 gap-[20px]'>
                {
                    queInfo.imageUrl != "" &&
                    <div>
                        <img src={APP_URL + queInfo?.imageUrl} className='w-full object-cover rounded-[8px]' />
                    </div>
                }

                <div>
                    {queInfo.questions.map((item, index) => {
                        return (
                            <div key={index} className="mt-[10px]">
                                <div className='flex items-start'>
                                    <div className='qa__title-text !font-bold'>Question: {index + 1} </div>
                                    <div className='qa__ques-info !font-bold !py-0'>{item?.question}</div>
                                </div>

                                <div className='flex items-center qa__wrapper'>
                                    <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "A"} className='qa__rdo mr-[10px]' />
                                    <div className='qa__title-text'>A </div>
                                    <div className='qa__ques-info'>{item?.answerA}</div>
                                </div>

                                <div className='flex items-center qa__wrapper'>
                                    <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "B"} className='qa__rdo mr-[10px]' />
                                    <div className='qa__title-text'>B </div>
                                    <div className='qa__ques-info'>{item?.answerB}</div>
                                </div>

                                <div className='flex items-center qa__wrapper'>
                                    <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "C"} className='qa__rdo mr-[10px]' />
                                    <div className='qa__title-text'>C </div>
                                    <div className='qa__ques-info'>{item?.answerC}</div>
                                </div>

                                <div className='flex items-center qa__wrapper'>
                                    <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "D"} className='qa__rdo mr-[10px]' />
                                    <div className='qa__title-text'>D </div>
                                    <div className='qa__ques-info'>{item?.answerD}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export function QuestionDouble({ queInfo }) {
    return (
        <div className='flex p-[20px] flex-col'>
            <div className='grid grid-cols-2 gap-[20px]'>
                {
                    queInfo.imageUrl != "" &&
                    <div className='flex flex-col'>
                        <img src={APP_URL + queInfo?.imageUrl_1} className='w-full object-cover rounded-[8px]' />
                        <img src={APP_URL + queInfo?.imageUrl_2} className='w-full object-cover mt-[10px]' />
                    </div>
                }

                <div>
                    {queInfo.questions.map((item, index) => {
                        return (
                            <div key={index} className="mt-[10px]">
                                <div className='flex items-start'>
                                    <div className='qa__title-text !font-bold'>Question: {index + 1} </div>
                                    <div className='qa__ques-info !font-bold !py-0'>{item?.question}</div>
                                </div>

                                <div className='flex items-center qa__wrapper'>
                                    <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "A"} className='qa__rdo mr-[10px]' />
                                    <div className='qa__title-text'>A </div>
                                    <div className='qa__ques-info'>{item?.answerA}</div>
                                </div>

                                <div className='flex items-center qa__wrapper'>
                                    <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "B"} className='qa__rdo mr-[10px]' />
                                    <div className='qa__title-text'>B </div>
                                    <div className='qa__ques-info'>{item?.answerB}</div>
                                </div>

                                <div className='flex items-center qa__wrapper'>
                                    <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "C"} className='qa__rdo mr-[10px]' />
                                    <div className='qa__title-text'>C </div>
                                    <div className='qa__ques-info'>{item?.answerC}</div>
                                </div>

                                <div className='flex items-center qa__wrapper'>
                                    <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "D"} className='qa__rdo mr-[10px]' />
                                    <div className='qa__title-text'>D </div>
                                    <div className='qa__ques-info'>{item?.answerD}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}

export function QuestionTriple({ queInfo }) {
    return (
        <div className='flex p-[20px] flex-col'>
            <div className='grid grid-cols-2 gap-[20px]'>
                {
                    queInfo.imageUrl != "" &&
                    <div className='flex flex-col'>
                        <img src={APP_URL + queInfo?.imageUrl_1} className='w-full object-cover rounded-[8px]' />
                        <img src={APP_URL + queInfo?.imageUrl_2} className='w-full object-cover mt-[10px]' />
                        <img src={APP_URL + queInfo?.imageUrl_3} className='w-full object-cover mt-[10px]' />
                    </div>
                }

                <div>
                    {queInfo.questions.map((item, index) => {
                        return (
                            <div key={index} className="mt-[10px]">
                                <div className='flex items-start'>
                                    <div className='qa__title-text !font-bold'>Question: {index + 1} </div>
                                    <div className='qa__ques-info !font-bold !py-0'>{item?.question}</div>
                                </div>

                                <div className='flex items-center qa__wrapper'>
                                    <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "A"} className='qa__rdo mr-[10px]' />
                                    <div className='qa__title-text'>A </div>
                                    <div className='qa__ques-info'>{item?.answerA}</div>
                                </div>

                                <div className='flex items-center qa__wrapper'>
                                    <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "B"} className='qa__rdo mr-[10px]' />
                                    <div className='qa__title-text'>B </div>
                                    <div className='qa__ques-info'>{item?.answerB}</div>
                                </div>

                                <div className='flex items-center qa__wrapper'>
                                    <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "C"} className='qa__rdo mr-[10px]' />
                                    <div className='qa__title-text'>C </div>
                                    <div className='qa__ques-info'>{item?.answerC}</div>
                                </div>

                                <div className='flex items-center qa__wrapper'>
                                    <input type='radio' name={`answerRdo-${index + 1}`} disabled checked={item.answerInfo.correctAnswer == "D"} className='qa__rdo mr-[10px]' />
                                    <div className='qa__title-text'>D </div>
                                    <div className='qa__ques-info'>{item?.answerD}</div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}


export default LessonHomework