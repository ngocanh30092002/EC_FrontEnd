import React, { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import DropDownList from './../../../CommonComponent/DropDownList';
import MaskedInput from 'react-text-mask';
import toast from '@/helper/Toast';

function CourseExamination() {
    const [isShowAddBoard, setIsShowAddBoard] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [examinationInfo, setExaminationInfo] = useState(null);
    const { contentId } = useParams();
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const rowPerPage = 9;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(questions.length / rowPerPage);

    const getExaminationInfo = async () => {
        try {
            const response = await appClient.get(`api/Examinations/contents/${contentId}`);
            const data = response.data;
            if (data.success) {
                setExaminationInfo(data.message);
            }
        }
        catch {

        }
    }

    const getQuestionInfo = async (toeicId) => {
        try {
            const response = await appClient.get(`api/QuesToeic/toeic/${toeicId}/result`);
            const data = response.data;
            if (data.success) {
                setQuestions(data.message.map((item, index) => ({ ...item, index: index + 1 })));
            }
        }
        catch {

        }
    }

    useEffect(() => {
        getExaminationInfo();
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

    const handleDeteteUser = (enrollId) => {
        const newEnrolls = enrollInfos.filter(e => e.enrollId != enrollId);
        newEnrolls.map((item, index) => ({ ...item, index: index + 1 }));
        setEnrollInfos(newEnrolls);
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
        if (sortConfig.length === 0) return [...questions];

        return [...questions].sort((a, b) => {
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
    }, [questions, sortConfig])


    useEffect(() => {
        if (examinationInfo != null) {
            getQuestionInfo(examinationInfo.toeicId);
        }
    }, [examinationInfo])

    const handleReloadInfo  = () =>{
        getExaminationInfo();
    }
    return (
        <div className='cep__wrapper px-[20px]'>
            <div className='flex justify-end '>
                {examinationInfo == null && <button className='cmp__add-class--btn mb-[20px]' onClick={(e) => setIsShowAddBoard(!isShowAddBoard)}>
                    {
                        isShowAddBoard ?
                            "Hide Board"
                            :
                            "Add Exam"
                    }
                </button>}
            </div>

            {isShowAddBoard && <CourseExaminationAddBoard isShow={isShowAddBoard} onShow={setIsShowAddBoard} onReloadInfo={handleReloadInfo}/>}

            <div className='member-page__tbl '>
                <div className="mpt__header flex w-full">
                    <div className="mpt__header-item w-1/4" onClick={(event) => { handleSort("index", event) }}>Question</div>
                    <div className="mpt__header-item w-1/4" onClick={(event) => { handleSort("part", event) }}>Part</div>
                    <div className="mpt__header-item w-1/4" onClick={(event) => { handleSort("level", event) }}>Level</div>
                    <div className="mpt__header-item w-1/4" onClick={(event) => { handleSort("isGroup", event) }}>Group</div>
                </div>

                <div className='mpt__body min-h-[446px] mt-[10px]'>
                    {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                        return (
                            <QuestionItem quesInfo={item} index={item.index} key={index} />
                        )
                    })}

                    {sortedData.length == 0 &&
                        <div className='w-full h-[390px] flex items-center justify-center'>
                            <span className='er__no-enrolls'>There are no members at this time.</span>
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
        </div>
    )
}

function CourseExaminationAddBoard({ isShow, onShow, onReloadInfo }) {
    const [toeicExams, setToeicExams] = useState([]);
    const [selectedToeic, setSelectedToeic] = useState(null);
    const [defaultIndex, setDefaultIndex] = useState(0);
    const [isCorrectExam, setIsCorrectExam] = useState(true);
    const { contentId } = useParams();
    const timeMask = [/\d/, /\d/, ':', /\d/, /\d/, ':', /\d/, /\d/];

    const inputTimeRef = useRef(null);
    const inputTitleRef = useRef(null);
    const inputDesRef = useRef(null);


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


    const getToeicExams = async () => {
        try {
            let response = await appClient.get("api/ToeicExams");
            let data = response.data;
            if (data.success) {
                setToeicExams(data.message.map((item, index) => ({ ...item, key: item.name, value: item.toeicId })));
            }
        }
        catch {

        }
    }

    const handleSelectedToeic = (item, index) => {
        setSelectedToeic(item);
        setDefaultIndex(index);
    }

    useEffect(() => {
        getToeicExams();
    }, [])

    const handleSubmitForm = async (event) => {
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

            if (inputDesRef.current && (inputDesRef.current.value == "" || inputDesRef.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Title is required",
                    duration: 4000
                })

                inputDesRef.current.classList.toggle("cabf__input--error");
                inputDesRef.current.focus();

                setTimeout(() => {
                    inputDesRef.current.classList.toggle("cabf__input--error");
                }, 2000);

                return;
            }

            if(!selectedToeic){
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Examnination is required",
                    duration: 4000
                })
                setIsCorrectExam(false)

                setTimeout(() => {
                    setIsCorrectExam(true);
                }, 2000);

                return;
            }

            const inputTime = inputTimeRef.current.inputElement;

            if(timeToSeconds(inputTime.value) < 7200){
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Time must be greater than 2 hours",
                    duration: 4000
                })

                return;
            }

            const formData = new FormData(event.target);
            formData.append("ToeicId", selectedToeic.toeicId);

            const response = await appClient.post("api/Examinations", formData);
            const data = response.data;
            if(data.success){
                toast({
                    type: "success",
                    title:"Success",
                    message:"Create examination successfully",
                    duration: 4000
                });

                onShow(false);
                onReloadInfo();
            }
        }
        catch {

        }
    }

    return (
        <form onSubmit={handleSubmitForm} className={`w-full mb-[20px] cab__wrapper p-[20px] border rounded-[10px] overflow-visible ${isShow ? "block" : "hidden"} p-[10px]`}>
            <div className='flex items-center overflow-visible'>
                <div className='flex items-center overflow-visible flex-1'>
                    <div className='ceab__title-text'>Title</div>
                    <input className='ceab__input' name='Title' ref={inputTitleRef} />
                    <input className='hidden' value={contentId} name='ContentId' readOnly />
                </div>
                <div className='flex items-center overflow-visible flex-1 ml-[20px]'>
                    <div className='ceab__title-text'>Examinations</div>
                    <DropDownList
                        data={toeicExams}
                        className={`border border-[#cccccc] !rounded-[20px] flex-1 ${!isCorrectExam && "cabf__input--error"}`}
                        onSelectedItem={handleSelectedToeic} />
                </div>
            </div>

            <div className='flex items-center mt-[20px]'>
                <div className='flex items-center overflow-visible flex-1'>
                    <div className='ceab__title-text' >Description</div>
                    <input className='ceab__input' name="Description" ref={inputDesRef} />
                </div>
                <div className='flex items-center overflow-visible flex-1 ml-[20px]'>
                    <div className='ceab__title-text'>Time</div>
                    <MaskedInput
                        name='Time'
                        mask={timeMask}
                        placeholder="00:00:00"
                        defaultValue={"02:00:00"}
                        className="lbh__input"
                        ref={inputTimeRef}
                    />
                </div>
            </div>

            <div className='flex justify-end mt-[20px]'>
                <button className='qi__btn-func !w-[200px]' type='submit'>Submit</button>
            </div>
        </form >
    )
}

export function QuestionItem({ quesInfo, index }) {
    const [isShowQuestion, setIsShowQuestion] = useState(false);
    let levelName = '';
    if (quesInfo.level == 1) {
        levelName = "Normal";
    }
    if (quesInfo.level == 2) {
        levelName = "Intermediate";
    }
    if (quesInfo.level == 3) {
        levelName = "Hard";
    }
    if (quesInfo.level == 4) {
        levelName = "Very Hard";
    }

    const handleShowQuestion = () => {
        setIsShowQuestion(true);
    }

    return (
        <>
            <div className={`mpt__row flex items-center mb-[10px]`} onClick={handleShowQuestion}>
                <div className="mpt__row-item w-1/4 ">Question {index}</div>
                <div className="mpt__row-item w-1/4 ">{quesInfo.part_Name}</div>
                <div className="mpt__row-item w-1/4 ">{levelName}</div>
                <div className="mpt__row-item w-1/4 ">{quesInfo.isGroup ? "True" : "False"}</div>
            </div>
            {
                isShowQuestion &&
                <>
                    {
                        quesInfo.isGroup === true ?
                            <QuesGroup question={quesInfo} onShow={setIsShowQuestion} />
                            :
                            <QuesNoGroup question={quesInfo} onShow={setIsShowQuestion} />
                    }
                </>
            }
        </>
    )
}

function QuesGroup({ question, onShow }) {
    const audioRef = useRef();
    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.load();
        }
    }, [question])

    return (
        <div className='fixed top-0 left-0 w-full flex justify-center items-center h-full ceq__wrapper z-[1000]' onClick={(e) => onShow(false)}>
            <div className='w-full h-full p-[20px] bg-white flex flex-col'>
                <div className='grid grid-cols-2 gap-[20px] flex-1'>
                    <div>
                        {question.image_1 !== "" && <img src={APP_URL + question.image_1} className='w-[85%] mx-auto' />}
                        {question.image_2 !== "" && <img src={APP_URL + question.image_2} className='w-[85%] mx-auto' />}
                        {question.image_3 !== "" && <img src={APP_URL + question.image_3} className='w-[85%] mx-auto' />}
                    </div>

                    <div>
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

                <div className='flex justify-between items-center mt-[10px]'>
                    <div>
                        {
                            question.audio &&
                            <>
                                <div className='flex justify-center col-span-2'>
                                    <audio controls ref={audioRef}>
                                        <source src={APP_URL + question.audio} type="audio/mpeg" />
                                    </audio>
                                </div>
                            </>
                        }
                    </div>


                    <div>
                        <button className='qit__btn-func' onClick={(e) => onShow(false)}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function QuesNoGroup({ question, onShow }) {
    const audioRef = useRef(null);
    const hasNoImage = question.image_1 === "" && question.image_2 === "" && question.image_3 === "";

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.load()
        }
    }, [question]);


    return (
        <div className='fixed top-0 left-0 w-full flex justify-center items-center h-full ceq__wrapper z-[1000]' onClick={(e) => onShow(false)}>
            <div className='w-full h-full p-[20px] bg-white flex flex-col' onClick={(e) => e.stopPropagation()}>
                <div className='grid grid-cols-2 gap-[20px] flex-1'>
                    {
                        !hasNoImage &&
                        <div>
                            {question.image_1 !== "" && <img src={APP_URL + question.image_1} className='w-full h-full object-contain' />}
                            {question.image_2 !== "" && <img src={APP_URL + question.image_2} className='w-full h-full object-contain' />}
                            {question.image_3 !== "" && <img src={APP_URL + question.image_3} className='w-full h-full object-contain' />}
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

                <div className='flex justify-between items-center mt-[10px]'>
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

                    <div>
                        <button className='qit__btn-func' onClick={(e) => onShow(false)}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>

    )
}

export function AnswerOptions({ part, quesInfo, num }) {
    const answerLetter = ["A", "B", "C", "D"];
    const hideQuesOptions = part == 1 || part == 2;
    const answerInfo = quesInfo.answerInfo;

    return (
        <div className='mb-[10px] min-h-[180px]'>
            <div className='qi__question inline-block'>
                Question {quesInfo.quesNo}. {quesInfo?.question && !hideQuesOptions && quesInfo.question}
            </div>

            {answerLetter.slice(0, num).map((answer, index) => {
                const answerKey = `answer${answer}`;
                return (
                    <div
                        key={index}
                        className={`qi__rdo-item ${answerInfo.correctAnswer == answer && "answer-true"}`}>
                        <input
                            type='radio'
                            disabled={true}
                            id={`answer-${quesInfo.quesNo}-${answer}`}
                            checked={answerInfo.correctAnswer == answer}
                            name={`answer${quesInfo.quesNo}`}
                            value={answer}
                        />
                        <label htmlFor={`answer-${quesInfo.quesNo}-${answer}`}>
                            {answer}.
                            {!hideQuesOptions && <span> {quesInfo[answerKey]}</span>}
                        </label>
                    </div>
                )
            })}

            <ResultItem answerInfo={answerInfo} quesInfo={quesInfo} part={part} />
        </div>
    )
}

export function ResultItem({ answerInfo, quesInfo, part }) {
    const isRenderQues = part == 1 || part == 2;
    const answerLetter = ["A", "B", "C", "D"];
    return (
        <div>
            {isRenderQues &&
                <div className='mb-[10px]'>
                    <div className='qi__question inline-block'>
                        {`Question ${quesInfo.quesNo}. ${quesInfo.question ?? ""}`}
                    </div>

                    {answerLetter.slice(0, part == 2 ? 3 : 4).map((answer, index) => {
                        const answerKey = `answer${answer}`;
                        return (
                            <div key={index}
                                className={`qi__result-rdo-item ${answerInfo.correctAnswer === answer && "answer-true"}`}>
                                <input
                                    disabled={true}
                                    type='radio'
                                    checked={answerInfo.correctAnswer === answer}
                                />
                                <label >
                                    {answer}. <span>{quesInfo[answerKey]}</span>
                                </label>
                            </div>
                        )
                    })}
                </div>
            }

            <div className='qi__question inline-block'>
                {`Question ${quesInfo.quesNo}. ${answerInfo.question ?? ""}`}
            </div>

            {answerLetter.slice(0, part == 2 ? 3 : 4).map((answer, index) => {
                const answerKey = `answer${answer}`;
                return (
                    <div key={index}
                        className={`qi__result-rdo-item ${answerInfo.correctAnswer === answer && "answer-true"}`}>
                        <input
                            disabled={true}
                            type='radio'
                            checked={answerInfo.correctAnswer === answer}
                        />
                        <label >
                            {answer}. <span>{answerInfo[answerKey]}</span>
                        </label>
                    </div>
                )
            })}

            {answerInfo?.explanation &&
                <div className='qi__question-explaination'>
                    <span className='qi__explaination--title'>Explanation: </span>
                    {answerInfo.explanation}
                </div>
            }
        </div>
    )
}


export default CourseExamination