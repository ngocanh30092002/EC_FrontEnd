import React, { useEffect, useRef, useState } from 'react'
import MaskedInput from 'react-text-mask';
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import toast from '@/helper/Toast';
import { useNavigate, useParams } from 'react-router-dom';
import { CreateRandom } from '@/helper/RandomHelper';
import DropDownList from '../../../../CommonComponent/DropDownList';
import { QuestionInfo } from './LessonHomework';
import { QuesToeicInfo } from '../../../Course/CourseMainDetail/RoadmapDetailInfo';

function HomeworkList({ lessonId, homework, onReloadHomework }) {
    const [renderHomework, setRenderHomework] = useState(homework);
    const [selectedFilter, setSelectedFilter] = useState(0);

    function parseDate(dateString) {
        const [time, date] = dateString.split(" ");
        const [day, month, year] = date.split("-").map(num => parseInt(num, 10));
        const [hour, minute, second] = time.split(":").map(num => parseInt(num, 10));
        return new Date(year, month - 1, day, hour, minute, second);
    }

    useEffect(() => {
        setRenderHomework(homework);
    }, [homework])

    useEffect(() => {
        let newRenderHw = homework;
        const currentDate = new Date();

        if (selectedFilter == 1) {
            newRenderHw = homework.filter(i => {
                const startDate = parseDate(i.startTime);
                return currentDate <= startDate
            })
        }
        if (selectedFilter == 2) {
            newRenderHw = homework.filter(i => {
                const startDate = parseDate(i.startTime);
                const endDate = parseDate(i.endTime);
                return startDate <= currentDate && currentDate <= endDate;
            })
        }
        if (selectedFilter == 3) {
            newRenderHw = homework.filter(i => {
                const endDate = parseDate(i.endTime);
                return currentDate >= endDate;
            })
        }

        setRenderHomework(newRenderHw)

    }, [selectedFilter])

    const dataFilter = [
        {
            key: "All",
            value: 0
        },
        {
            key: "Waiting",
            value: 1
        },
        {
            key: "Ongoing",
            value: 2
        },
        {
            key: "Overdue",
            value: 3
        },
    ]

    const handleSelectedFilter = (item, index) => {
        setSelectedFilter(item?.value);
    }
    return (
        <>
            {homework.length != 0 &&
                <div className='hwl__wrapper px-[20px] mt-[10px]  overflow-visible min-h-[570px]'>
                    <div className='flex justify-between items-center my-[20px] overflow-visible'>
                        <div>
                            <div className='st__title'>Homeworks</div>
                        </div>
                        <div className='flex items-center overflow-visible w-[150px]'>
                            <div className='st__filter-title'>Filter: </div>
                            <DropDownList data={dataFilter} defaultIndex={0} hideDefault={true} onSelectedItem={handleSelectedFilter} className={"border !py-[8px] flex-1 "} />
                        </div>
                    </div>
                    <div className='grid grid-cols-2 gap-[10px]'>
                        {renderHomework.map((item, index) => {
                            return (
                                <HomeworkItem homeInfo={item} key={index} onReloadHomework={onReloadHomework} />
                            )
                        })}
                    </div>
                </div>
            }
        </>
    )
}

function HomeworkItem({ homeInfo, onReloadHomework }) {
    const { lessonId } = useParams();
    const [imageUrl, setImageUrl] = useState(() => {
        return homeInfo.image == null ? IMG_URL_BASE + "default_bg.jpg" : APP_URL + homeInfo.image;
    })
    const [fileImage, setFileImage] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isAddQuesBoard, setIsAddQuesBoard] = useState(false);
    const [title, setTitle] = useState(homeInfo.title);
    const [time, setTime] = useState(homeInfo.time);
    const parseDate = (dateStr) => {
        const [time, date] = dateStr.split(' ');

        const [day, month, year] = date.split('-');

        return new Date(`${year}-${month}-${day}T${time}`);
    }
    const [startDate, setStartDate] = useState(() => {
        const date = parseDate(homeInfo.startTime);
        const offsetDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        const formattedDateTime = offsetDateTime.toISOString().slice(0, 16);
        return formattedDateTime;
    })
    const [endDate, setEndDate] = useState(() => {
        const date = parseDate(homeInfo.endTime);
        const offsetDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
        const formattedDateTime = offsetDateTime.toISOString().slice(0, 16);
        return formattedDateTime;
    })
    const [lateDays, setLateDays] = useState(homeInfo.lateSubmitDays);
    const [passRate, setPassRate] = useState(homeInfo.achieved_Percentage);
    const [isShowDetail, setIsShowDetail] = useState(false);
    const timeMask = [/\d/, /\d/, ':', /\d/, /\d/, ':', /\d/, /\d/];

    const inputTitleRef = useRef(null);
    const inputTimeRef = useRef(null);
    const inputStartRef = useRef(null);
    const inputEndRef = useRef(null);
    const inputDaysRef = useRef(null);
    const inputPassRef = useRef(null);
    const inputFileImageRef = useRef(null);

    useEffect(() => {
        setImageUrl(prev => {
            return homeInfo.image == null ? IMG_URL_BASE + "default_bg.jpg" : APP_URL + homeInfo.image;
        })
        setFileImage(null);
        setIsEditing(false);
        setTitle(homeInfo.title);
        setTime(homeInfo.time);
        setStartDate(prev => {
            const date = parseDate(homeInfo.startTime);
            const offsetDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
            const formattedDateTime = offsetDateTime.toISOString().slice(0, 16);
            return formattedDateTime;
        })

        setEndDate(prev => {
            const date = parseDate(homeInfo.endTime);
            const offsetDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
            const formattedDateTime = offsetDateTime.toISOString().slice(0, 16);
            return formattedDateTime;
        })

        setLateDays(homeInfo.lateSubmitDays);
        setPassRate(homeInfo.achieved_Percentage);

    }, [homeInfo])

    const handleSetLateDays = (event) => {
        if (inputDaysRef.current) {
            setLateDays(event.target.value.replace(/[^0-9]/g, ''));
        }
    }

    const handleSetPassRate = (event) => {
        const value = event.target.value.replace(/[^0-9]/g, '');
        const numericValue = parseInt(value, 10);

        if (numericValue >= 0 && numericValue <= 100) {
            setPassRate(numericValue);
        } else {
            setPassRate("");
        }
    }

    const handleSubmitHw = async (event) => {
        event.preventDefault();

        if (!isEditing) {
            setIsEditing(!isEditing);
        }
        else {
            let confirmAnswer = confirm("Do you want to save this homework?");
            if (confirmAnswer) {
                if (title == null || title == "") {
                    toast({
                        type: "error",
                        title: "ERROR",
                        message: "Title is invalid",
                        duration: 4000
                    });

                    setTitle(homeInfo.title)
                    inputTitleRef.current.focus();

                    return;
                }

                const timeInput = inputTimeRef.current?.inputElement;
                const timeRegex = /^([0-1][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/

                if (timeInput.value == "" || timeInput.value == null || !timeRegex.test(timeInput.value)) {
                    toast({
                        type: "error",
                        title: "ERROR",
                        message: "Time is invalid",
                        duration: 4000
                    });

                    setTime(homeInfo.time);

                    timeInput.focus();
                    timeInput.classList.toggle("cabf__input--error");

                    setTimeout(() => {
                        timeInput.classList.toggle("cabf__input--error");
                    }, 2000);

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

                    inputStartRef.current.classList.toggle("cabf__input--error");

                    setStartDate(prev => {
                        const date = parseDate(homeInfo.startTime);
                        const offsetDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                        const formattedDateTime = offsetDateTime.toISOString().slice(0, 16);
                        return formattedDateTime;
                    })

                    setEndDate(prev => {
                        const date = parseDate(homeInfo.endTime);
                        const offsetDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
                        const formattedDateTime = offsetDateTime.toISOString().slice(0, 16);
                        return formattedDateTime;
                    })

                    setTimeout(() => {
                        inputStartRef.current.classList.toggle("cabf__input--error")
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

                if (lateDays == "" || lateDays == null) {
                    toast({
                        type: "error",
                        title: "ERROR",
                        message: "Late Days is required",
                        duration: 4000
                    });

                    inputDaysRef.current.focus();
                    setLateDays(homeInfo.lateSubmitDays)
                    inputDaysRef.current.classList.toggle("cabf__input--error");

                    setTimeout(() => {
                        inputDaysRef.current.classList.toggle("cabf__input--error");
                    }, 2000);

                    return;
                }

                if (passRate == "" || passRate == null) {
                    toast({
                        type: "error",
                        title: "ERROR",
                        message: "Pass Rate is required",
                        duration: 4000
                    });

                    inputPassRef.current.focus();
                    setPassRate(homeInfo.achieved_Percentage)
                    inputPassRef.current.classList.toggle("cabf__input--error");

                    setTimeout(() => {
                        inputPassRef.current.classList.toggle("cabf__input--error");
                    }, 2000);

                    return;
                }

                const formData = new FormData(event.target);
                formData.append("LessonId", lessonId);
                console.log(Object.fromEntries(formData));
                const response = await appClient.put(`api/homework/${homeInfo.homeworkId}`, formData);
                const data = response.data;
                if (data.success) {
                    toast({
                        type: "success",
                        title: "Success",
                        message: "Update homework successfully",
                        duration: 4000
                    });

                    setIsEditing(false);
                }
            }
        }
    }

    const handleDeleteHw = async (event) => {
        event.preventDefault();
        try {
            const confirmAnswer = confirm("Do you want to delete this homework");
            if (confirmAnswer) {
                const response = await appClient.delete(`api/homework/${homeInfo.homeworkId}`);
                const dataRes = response.data;

                if (dataRes.success) {
                    toast({
                        type: "success",
                        title: "Success",
                        message: "Delete homework successfully",
                        duration: 4000
                    });

                    setIsEditing(false);
                    onReloadHomework();
                }
            }
        }
        catch {

        }
    }

    const handleChangeImage = (event) => {
        if (inputFileImageRef.current && isEditing == true) {
            inputFileImageRef.current.click();
        }
    }

    const handleChangeFileImage = (event) => {
        let file = event.target.files[0];
        if (file) {
            setFileImage(file);
            setImageUrl(URL.createObjectURL(file));
        }
    }

    const handleAddQuestion = (event) => {
        event.preventDefault();
        setIsAddQuesBoard(true);
    }

    const handleClickHomework = (event) => {
        event.preventDefault();

        if (!isEditing) {
            setIsShowDetail(true);
        }
    }

    return (
        <>
            <form className={`hwi__wrapper flex flex-col w-full border rounded-[10px] p-[15px] `} method='POST' onSubmit={handleSubmitHw} onClick={handleClickHomework} >
                <img src={imageUrl} className='hwi__image cursor-pointer' onClick={handleChangeImage} />

                <input
                    className='hwi__title border rounded-[10px] mt-[10px] border-transparent'
                    readOnly={!isEditing}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    ref={inputTitleRef}
                    name='Title'
                />

                <input type='file' accept='image/*' className='hidden' onChange={handleChangeFileImage} name='Image' ref={inputFileImageRef} />

                <div className='flex items-center'>
                    <div className='hwi__header-text'>Time</div>
                    <MaskedInput
                        name='Time'
                        mask={timeMask}
                        placeholder="00:00:00"
                        className={`hwi__input-value ${!isEditing && "cursor-pointer"}`}
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        ref={inputTimeRef}
                        readOnly={!isEditing}
                    />
                </div>
                <div className='flex items-center'>
                    <div className='hwi__header-text'>Start</div>
                    <input
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        readOnly={!isEditing}
                        ref={inputStartRef}
                        className={`hwi__input-value ${!isEditing && "cursor-pointer"}`}
                        name='StartTime'
                    />
                </div>
                <div className='flex items-center'>
                    <div className='hwi__header-text'>End</div>
                    <input
                        type="datetime-local"
                        value={endDate}
                        ref={inputEndRef}
                        onChange={(e) => setEndDate(e.target.value)}
                        readOnly={!isEditing}
                        className={`hwi__input-value ${!isEditing && "cursor-pointer"}`}
                        name='EndTime'
                    />
                </div>

                <div className='flex items-center'>
                    <div className='hwi__header-text'>Late days</div>
                    <input
                        className={`hwi__input-value ${!isEditing && "cursor-pointer"}`}
                        readOnly={!isEditing}
                        value={lateDays}
                        onChange={handleSetLateDays}
                        ref={inputDaysRef}
                        name='LateSubmitDays'
                    />
                </div>

                <div className='flex items-center'>
                    <div className='hwi__header-text'>Pass Rate</div>
                    <input
                        className={`hwi__input-value ${!isEditing && "cursor-pointer"}`}
                        readOnly={!isEditing}
                        value={passRate}
                        onChange={handleSetPassRate}
                        ref={inputPassRef}
                        name='Achieved_Percentage'
                    />
                </div>


                <div className='flex w-full mt-[20px]' onClick={(e) => e.stopPropagation()}>
                    <button className='flex-1 hwi__btn-func mr-[10px]' onClick={handleAddQuestion}>Add Ques</button>
                    <button className='flex-1 hwi__btn-func mr-[10px] edit' type='submit'>
                        {!isEditing ?
                            "Edit" :
                            "Save"
                        }
                    </button>
                    <button className='flex-1 hwi__btn-func delete' onClick={handleDeleteHw}>Delete</button>
                </div>
            </form>

            {isShowDetail == true && <HomeworkDetail homeInfo={homeInfo} onShowDetail={setIsShowDetail} />}
            {isAddQuesBoard == true && homeInfo.type == 1 && <AddQuestionBoard homeInfo={homeInfo} onShow={setIsAddQuesBoard} onReloadHomework={onReloadHomework} />}
            {isAddQuesBoard == true && homeInfo.type == 2 && <AddQuestionToeicBoard homeInfo={homeInfo} onShow={setIsAddQuesBoard} onReloadHomework={onReloadHomework} />}
        </>
    )
}

function AddQuestionToeicBoard({ homeInfo, onShow, onReloadHomework }) {
    const [selectedQues, setSelectedQues] = useState(() => {
        return Array.from({ length: 7 }).reduce((acc, _, i) => {
            acc[i + 1] = [];
            return acc;
        }, {});
    });
    const [previousQues, setPreviousQues] = useState([]);

    const inputExpectedTimeRef = useRef(null);
    const inputTimeRef = useRef(null);
    const quesToeicInfoRef = useRef(null);

    const [renderQueIds, setRenderQueIds] = useState([]);
    const [partTypes, setPartTypes] = useState([]);
    const [queIds, setQueIds] = useState([]);
    const [selectedType, setSelectedType] = useState(null);
    const [indexType, setIndexType] = useState(0);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [indexQuestion, setIndexQuesion] = useState(-1);
    const timeMask = [/\d/, /\d/, ':', /\d/, /\d/, ':', /\d/, /\d/];

    const [isSelected, setIsSelected] = useState(false);

    const getCurrentQuesWithPart = async () => {
        try {
            const response = await appClient.get(`api/RandomQues/homework/${homeInfo.homeworkId}/num`);
            const dataRes = response.data;

            if (dataRes.success) {
                const result = dataRes.message;
                setPreviousQues(Object.values(result));
            }
        }
        catch {

        }
    }

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

    const handleSelectedType = (item, index) => {
        setSelectedType(item);
        setIndexType(index);

        setIndexQuesion(-1);
        setSelectedQuestion(null);
    }

    const handleSelectedQuestion = (item, index) => {
        setIndexQuesion(index);
        setSelectedQuestion(item);
    }

    const getFullQuesId = async () => {
        try {
            const response = await appClient.get(`api/QuesToeic/homework/${homeInfo.homeworkId}/other-ques`);
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
                setSelectedType(data.message[0]);
                setIndexType(0);
            }
        }
        catch {

        }
    }

    const handleDeleteQues = (event) => {
        event.preventDefault();
        setSelectedQues(prev => {
            if (selectedQuestion != null) {
                let type = selectedType.value;
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
                let type = selectedType.value
                const length = prev[type] ? prev[type].length : 0;

                if (prev[type]) {
                    prev[type] = prev[type].filter(i => i !== selectedQuestion.key);
                    let isValid = true;
                    if (type == 1 && prev[type].length + previousQues[type - 1] >= 6) {
                        isValid = false;
                    }
                    if (type == 2 && prev[type].length + previousQues[type - 1] >= 25) {
                        isValid = false;
                    }
                    if (type == 3 && prev[type].length + previousQues[type - 1] >= 13) {
                        isValid = false;
                    }
                    if (type == 4 && prev[type].length + previousQues[type - 1] >= 10) {
                        isValid = false;
                    }
                    if (type == 5 && prev[type].length + previousQues[type - 1] >= 30) {
                        isValid = false;
                    }
                    if (type == 6 && prev[type].length + previousQues[type - 1] >= 4) {
                        isValid = false;
                    }
                    if (type == 7 && prev[type].length + previousQues[type - 1] >= 15) {
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

    const handleSubmitQuestion = async (event) => {
        event.preventDefault();
        try {
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

                if (seconds < timeToSeconds(inputExpectedTimeRef.current.value)) {
                    toast({
                        type: "error",
                        title: "ERROR",
                        message: "Time must be greater than expected time",
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

            let confirmAnswer = confirm("Do you want to update this homework?");
            if (!confirmAnswer) return;

            const formData = new FormData();

            let indexNum = 0;
            Object.keys(selectedQues).forEach((key, index) => {
                selectedQues[key].forEach((item, indexQue) => {
                    formData.append(`models[${indexNum}].HomeworkId`, homeInfo.homeworkId);
                    formData.append(`models[${indexNum}].QuesToeicId`, item);
                    indexNum++;
                })
            })

            let response = await appClient.post(`api/RandomQues/homework/list`, formData);
            let dataRes = response.data;

            if(dataRes.success){
                response = await appClient.patch(`api/Homework/${homeInfo.homeworkId}/change-time`, inputTime.value, {
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                toast({
                    type: "success",
                    title: "Success",
                    message: "Update assignment successfully",
                    duration: 4000
                });

                onShow(false);
                onReloadHomework();
            }
        }
        catch (err) {
            console.error(err);
        }
    }

    useEffect(() => {
        inputExpectedTimeRef.current.value = homeInfo.time;
        inputTimeRef.current.inputElement.value = homeInfo.time;

        setSelectedQues(prev => {
            return Array.from({ length: 7 }).reduce((acc, _, i) => {
                acc[i + 1] = [];
                return acc;
            }, {});
        })

        getPartTypes();
        getFullQuesId();
        getCurrentQuesWithPart();
    }, [])

    useEffect(() => {
        if (selectedQuestion) {
            setIsSelected(selectedQues[selectedType.value].some(i => i == selectedQuestion.key));
        }
        else {
            setIsSelected(false);
        }
    }, [selectedQuestion, selectedQues])

    useEffect(() => {
        if (selectedType) {
            var renderQues = queIds.filter(q => q.part == selectedType.value).map((item, index) => ({ key: item.quesId, value: item.quesId }));
            setRenderQueIds(renderQues);
        }
    }, [selectedType, queIds])

    return (
        <div className='fixed top-0 left-0 w-full h-full z-[1000] hd__wrapper flex items-center justify-center' onClick={(e) => onShow(false)}>
            <div className='hd__content__wrapper w-[1200px] overflow-visible h-[660px] p-[20px] rounded-[10px] bg-white' onClick={(e) => e.stopPropagation()}>
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

                <div className="flex mt-[20px] overflow-visible">
                    <div className='flex items-center flex-1 overflow-visible'>
                        <div className="lbh__title-text">Question Part </div>
                        <DropDownList
                            data={partTypes}
                            defaultIndex={0}
                            className={"lbh__input"}
                            onSelectedItem={handleSelectedType} />
                    </div>

                    <div className='flex items-center flex-1 overflow-visible'>
                        <div className="lbh__title-text">Question </div>
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
                        return (
                            <div className='rm__part--title flex' key={index}>
                                <div className='font-bold'>{item.key}:</div>
                                <div className='ml-[10px]'>{selectedQues[item.value].length + previousQues[index]}</div>
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
                        <button className='qi__btn-func !w-[200px]' onClick={handleSubmitQuestion}>Submit</button>
                    </div>
                </div>

                {selectedQuestion != null && <QuesToeicInfo quesId={selectedQuestion.value} ref={quesToeicInfoRef} />}
            </div>
        </div>
    )
}

function AddQuestionBoard({ homeInfo, onShow, onReloadHomework }) {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedQues, setSelectedQues] = useState(() => {
        return Array.from({ length: 7 }).reduce((acc, _, i) => {
            acc[i + 1] = [];
            return acc;
        }, {});
    });
    const [selectedType, setSelectedType] = useState(null);
    const [selectedQuesId, setSelectedQuesId] = useState(null);
    const [defaultQues, setDefaultQues] = useState(-1);
    const [defaultType, setDefaultType] = useState(-1);
    const [listQues, setListQues] = useState([]);
    const [queTypes, setQueTypes] = useState([]);

    const inputTimeRef = useRef(null);
    const inputExpectedTimeRef = useRef(null);

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

    const getListQuestions = async () => {
        try {
            let apiQuestions = undefined;

            switch (selectedType) {
                case 1:
                    apiQuestions = `api/lc-images/homework/${homeInfo.homeworkId}/other`;
                    break;
                case 2:
                    apiQuestions = `api/lc-audios/homework/${homeInfo.homeworkId}/other`;
                    break;
                case 3:
                    apiQuestions = `api/lc-con/homework/${homeInfo.homeworkId}/other`;
                    break;
                case 4:
                    apiQuestions = `api/rc-sentence/homework/${homeInfo.homeworkId}/other`;
                    break;
                case 5:
                    apiQuestions = `api/rc-single/homework/${homeInfo.homeworkId}/other`;
                    break;
                case 6:
                    apiQuestions = `api/rc-double/homework/${homeInfo.homeworkId}/other`;
                    break;
                case 7:
                    apiQuestions = `api/rc-triple/homework/${homeInfo.homeworkId}/other`;
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

    const handleSubmitHw = async (event) => {
        event.preventDefault();

        try {
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
                let expectedSeconds = timeToSeconds(inputExpectedTimeRef.current.value);

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

                if (seconds < expectedSeconds) {
                    toast({
                        type: "error",
                        title: "ERROR",
                        message: "Expected time is invalid",
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

            let confirmAnswer = confirm("Do you want to update this homework?");
            if (!confirmAnswer) return;

            const formDataHomeQues = new FormData();

            Object.keys(selectedQues).forEach((key, index) => {
                formDataHomeQues.append(`listModels[${index}].Type`, key);

                selectedQues[key].forEach((item, indexQue) => {
                    formDataHomeQues.append(`listModels[${index}].QueIds[${indexQue}]`, item);
                })
            })

            let response = await appClient.post(`api/HomeQues/homework/${homeInfo.homeworkId}`, formDataHomeQues);
            let dataRes = response.data;
            if (dataRes.success) {
                response = await appClient.patch(`api/Homework/${homeInfo.homeworkId}/change-time`, inputTime.value, {
                    headers: {
                        "Content-Type": "application/json"
                    }
                });

                dataRes = response.data;

                toast({
                    type: "success",
                    title: "Success",
                    message: "Update assignment successfully",
                    duration: 4000
                });

                onShow(false);
                onReloadHomework();
            }
        }
        catch (err) {
            console.log(err);
        }
    }


    useEffect(() => {
        inputExpectedTimeRef.current.value = homeInfo.time;
        inputTimeRef.current.inputElement.value = homeInfo.time;
        getQuesTypes();
    }, [])
    return (
        <div className='fixed top-0 left-0 w-full h-full z-[1000] hd__wrapper flex items-center justify-center' onClick={(e) => onShow(false)}>
            <div className='hd__content__wrapper w-[1200px]  h-[660px] p-[20px] rounded-[10px] bg-white' onClick={(e) => e.stopPropagation()}>
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
                                <button className='qi__btn-func !w-[200px]' onClick={handleSubmitHw}>Submit Homework</button>
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
            </div>
        </div>
    )
}

function HomeworkDetail({ homeInfo, onShowDetail }) {
    const [submissions, setSubmissions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const rowPerPage = 5;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(submissions.length / rowPerPage);

    const getSubmissions = async () => {
        try {
            const response = await appClient.get(`api/HwSubmission/homework/${homeInfo.homeworkId}`);
            const data = response.data;

            if (data.success) {
                setSubmissions(data.message.map((item, index) => ({ ...item, index: index + 1 })));
            }
        }
        catch {

        }
    }

    useEffect(() => {
        getSubmissions();
    }, [])

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


    const handleReloadSubmissions = () => {
        getSubmissions();
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
        if (sortConfig.length === 0) return [...submissions];

        return [...submissions].sort((a, b) => {
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
    }, [submissions, sortConfig])

    useEffect(() => {
        if (searchValue != "") {
            setSortedData(prev => {
                let newPrev = prev.filter(item => {
                    const fullName = removeVietnameseAccents(item.userName).toLowerCase();
                    const search = removeVietnameseAccents(searchValue.toLowerCase());
                    return fullName.includes(search);
                })

                return newPrev;
            })
        }
        else {
            setSortedData(sortedDataFunc());
        }
    }, [searchValue]);

    return (
        <div className='fixed top-0 left-0 w-full h-full z-[1000] hd__wrapper flex items-center justify-center' onClick={(e) => onShowDetail(false)}>
            <div className='hd__content__wrapper w-[1000px] flex flex-col h-[510px] p-[20px] rounded-[10px] bg-white' onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between">
                    <div className='sfb__title'>Submission Records</div>
                    <div className="flex items-center">
                        <div className='mpt__header-item--search-icon'>
                            <img src={IMG_URL_BASE + "search_icon.svg"} className='w-[30px] p-[6px]' />
                        </div>
                        <input placeholder='Search name ...' className='mpt__header-item--search' value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                    </div>
                </div>

                <div className='cmp__tbl mt-[10px] flex-1'>
                    <div className='cmp__tbl__header flex w-full mb-[10px]'>
                        <div className='mpt__header-item w-1/12' onClick={(event) => handleSort("index", event)}>No</div>
                        <div className='mpt__header-item w-1/4' onClick={(event) => handleSort("userName", event)}>User Info</div>
                        <div className='mpt__header-item w-1/12' onClick={(event) => handleSort("status", event)}>Status</div>
                        <div className='mpt__header-item w-1/12' onClick={(event) => handleSort("score.isPass", event)}>Pass/Fail</div>
                        <div className='mpt__header-item w-1/12' onClick={(event) => handleSort("score.current_Percentage", event)}>Rate</div>
                        <div className='mpt__header-item w-1/12' onClick={(event) => handleSort("score.correct", event)}>Point</div>
                        <div className='mpt__header-item w-1/4' onClick={(event) => handleSort("feedBack", event)}>Feedback</div>
                        <div className='mpt__header-item w-1/12'></div>
                    </div>
                    <div className='mpt__body min-h-[255px] mt-[10px]'>
                        {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                            return (
                                <HomeworkDetailItem detailInfo={item} key={index} index={item.index} onReloadSubmission={handleReloadSubmissions} />
                            )
                        })}
                    </div>
                </div>


                <div className='flex justify-end items-center mt-[20px]'>
                    <button className='mpt__page-btn' onClick={(e) => setCurrentPage(prev => 1)}>
                        <img src={IMG_URL_BASE + "previous.svg"} className="w-[20px] " />
                    </button>

                    <button className='mpt__page-btn' onClick={(e) => setCurrentPage(prev => {

                        return prev == 1 ? 1 : parseInt(prev) - 1;
                    })}>
                        <img src={IMG_URL_BASE + "pre_page_icon.svg"} className="w-[20px]" />
                    </button>

                    <input className='mpt__page-input' value={currentPage} onChange={handleChangePage} onInput={handleInputPage} />

                    <button className='mpt__page-btn' onClick={(e) => setCurrentPage(prev => parseInt(prev) + 1)}>
                        <img src={IMG_URL_BASE + "next_page_icon.svg"} className="w-[20px]" />
                    </button>

                    <button className='mpt__page-btn' onClick={(e) => setCurrentPage(prev => totalPage)}>
                        <img src={IMG_URL_BASE + "next.svg"} className="w-[20px]" />
                    </button>
                </div>
            </div>
        </div>
    )
}

function HomeworkDetailItem({ detailInfo, index, onReloadSubmission }) {
    const navigate = useNavigate();
    const [isEditing, setIsEditing] = useState(false);
    const [feedbackValue, setFeedbackValue] = useState(detailInfo.feedBack ?? "");

    const handleEditDetailItem = async (event) => {
        event.stopPropagation();
        event.preventDefault();

        if (!isEditing) {
            setIsEditing(!isEditing)
        }
        else {
            const response = await appClient.patch(`api/HwSubmission/${detailInfo.submissionId}/feedback`, feedbackValue, {
                headers: {
                    "Content-Type": 'application/json',
                }
            })

            const data = response.data;
            if (data.success) {
                toast({
                    type: "success",
                    title: "Successfully",
                    message: "Send feedback successfully",
                    duration: 4000
                });

                setIsEditing(!isEditing);
                onReloadSubmission();
            }
        }
    }

    const handleClickViewResult = () => {
        if (detailInfo.homework.type == 1) {
            const sessionId = CreateRandom();
            sessionStorage.setItem(sessionId, detailInfo.submissionId);
            navigate(`/assignment/prepare-homework?id=${sessionId}`)
        }
        else {
            const sessionId = CreateRandom();
            sessionStorage.setItem(sessionId, detailInfo.submissionId);
            navigate(`/examination/prepare-homework?id=${sessionId}&mode=view-answer`)
        }

    }

    useEffect(() => {
        setFeedbackValue(detailInfo.feedBack ?? "");
    }, [detailInfo])

    return (
        <div className='cmp__tbl__row flex w-full items-center' onClick={handleClickViewResult}>
            <div className='cmp__tbl__row-item  w-1/12 flex items-center'># {index}</div>
            <div className="cmp__tbl__row-item w-1/4 flex items-center">
                <div>
                    <img src={detailInfo?.imageUrl != null ? APP_URL + detailInfo.imageUrl : IMG_URL_BASE + "unknown_user.jpg"} className='w-[45px] h-[45px] rounded-[10px] object-cover' />
                </div>

                <div className='flex-1'>
                    <div className='line-clamp-1 cabf__ti--text !text-[12px]'>{detailInfo.userName}</div>
                    <div className='line-clamp-1 cabf__ti--text !text-[12px]'>{detailInfo.email}</div>
                </div>
            </div>
            <div className="cmp__tbl__row-item w-1/12 flex items-center !text-[12px]">{detailInfo.status}</div>
            <div className="cmp__tbl__row-item w-1/12 flex items-center !text-[12px]">
                {
                    detailInfo.score.isPass ? "Passed" : "Failed"
                }
            </div>
            <div className="cmp__tbl__row-item w-1/12 flex items-center !text-[12px]">
                {detailInfo.score.current_Percentage}%
            </div>
            <div className="cmp__tbl__row-item w-1/12 flex items-center !text-[12px]">
                {detailInfo.score.correct} / {detailInfo.score.total}
            </div>
            <div className="cmp__tbl__row-item w-1/4 flex items-center !text-[12px]" onClick={(e) => e.stopPropagation()}>
                <input
                    className={`p-[10px] w-full rounded-[10px] bg-transparent cursor-pointer ${isEditing && "border bg-white"}`}
                    value={feedbackValue}
                    onChange={(e) => setFeedbackValue(e.target.value)} />
            </div>
            <div className="cmp__tbl__row-item w-1/12 flex items-center !text-[12px]">
                <button className='mpt__item--btn' onClick={handleEditDetailItem}>
                    {
                        isEditing ?
                            <img src={IMG_URL_BASE + "check_thin_icon.svg"} className='w-[30px] p-[2px]' />
                            :
                            <img src={IMG_URL_BASE + "edit-icon.svg"} className='w-[30px] p-[6px]' />
                    }
                </button>
            </div>
        </div>
    )
}
export default HomeworkList