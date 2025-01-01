import toast from '@/helper/Toast';
import React, { Suspense, useEffect, useState } from 'react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE } from '~/GlobalConstant.js';
import { QuesGroup, QuesNoGroup } from '../../Course/CourseMainDetail/RoadmapDetailInfo';
import ToeicAddBoard from './ToeicAddBoard';
import LoaderPage from '../../../LoaderComponent/LoaderPage';

function QuestionToeicListBoard({ isTeacher = false }) {
    const [toeicExams, setToeicExams] = useState([]);
    const [isShowAddBoard, setIsShowBoard] = useState(false);
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowPerPage = 6;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(toeicExams.length / rowPerPage);

    const getToeicExams = async () => {
        try {
            const response = await appClient.get("api/ToeicExams");
            const dataRes = response.data;
            if (dataRes.success) {
                setToeicExams(dataRes.message.map((item, index) => ({ ...item, index: index + 1 })))
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

    const handleDeleteCourse = (id) => {
        let newToeicExams = toeicExams.filter(c => c.toeicId != id);
        newToeicExams = newToeicExams.map((item, index) => ({ ...item, index: index + 1 }));
        setToeicExams(newToeicExams);
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
        if (sortConfig.length === 0) return [...toeicExams];

        return [...toeicExams].sort((a, b) => {
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
        getToeicExams();
    }, [])


    useEffect(() => {
        setSortedData(sortedDataFunc());
    }, [toeicExams, sortConfig])

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

    const handleReloadExams = () => {
        getToeicExams();
    }

    return (
        <div className='qtp__wrapper px-[20px] h-full'>
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
                        <button className='cmp__add-class--btn ml-[20px]' onClick={(e) => setIsShowBoard(!isShowAddBoard)}>
                            {
                                !isShowAddBoard ?
                                    "Add Toeic"
                                    :
                                    "Hide Board"
                            }
                        </button>
                    }
                </div>
            </div>

            <ToeicAddBoard isShow={isShowAddBoard} onShow={setIsShowBoard} onReloadExams={handleReloadExams} />


            <div className='clb__wrapper'>
                <div className="clb__tbl__wrapper mt-[20px] ">
                    <div className="mpt__header flex w-full items-center">
                        <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("index", event)}>No</div>
                        <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("name", event)}>Toeic Name</div>
                        <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("point", event)}>Point</div>
                        <div className="mpt__header-item w-1/6" onClick={(event) => handleSort("timeMinutes", event)}>Time minute</div>
                        <div className="mpt__header-item w-1/6" onClick={(event) => handleSort("completed_Num", event)}>Completed Num</div>
                        <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("isFull", event)}>Full</div>
                        <div className="mpt__header-item w-1/6"></div>
                    </div>

                    <div className='mpt__body min-h-[480px] mt-[10px]'>
                        {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                            return (
                                <ToeicExamItem
                                    examInfo={item}
                                    key={index}
                                    index={item.index}
                                    onDeleteExam={handleDeleteCourse}
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

function ToeicExamItem({ examInfo, index, onDeleteExam, isTeacher = false }) {
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [isShowDetail, setIsShowDetail] = useState(false);
    const minuteToTime = (minutes) => {
        const totalSeconds = Math.floor(minutes * 60);

        const hours = Math.floor(totalSeconds / 3600);
        const remainingSecondsAfterHours = totalSeconds % 3600;

        const mins = Math.floor(remainingSecondsAfterHours / 60);
        const seconds = remainingSecondsAfterHours % 60;

        const formattedTime = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

        return formattedTime;
    }

    const handleRemoveClick = async (event) => {
        event.preventDefault();
        try {
            let confirmAnswer = confirm("Do you want to delete this exam?");

            if (confirmAnswer) {
                setIsLoading(true);

                const response = await appClient.delete(`api/ToeicExams/${examInfo.toeicId}`);
                const data = response.data;
                if (data.success) {
                    toast({
                        type: "success",
                        title: "Success",
                        message: "Delete exam successfully",
                        duration: 4000
                    });

                    setIsLoading(false);
                    onDeleteExam(examInfo.toeicId);
                }
            }
        }
        catch {
            setIsLoading(false);
        }
    }

    const handleShowQuestions = (event) => {
        setIsShowDetail(true);
    }

    const handleAddQuestions = (event) => {
        event.preventDefault();

        navigate(`${examInfo.toeicId}/add-ques`);
    }
    return (
        <>
            {isLoading == false &&
                <div className={`mpt__row flex items-center mb-[10px]`} onClick={handleShowQuestions}>
                    <div className="mpt__row-item w-1/12 "># {index}</div>
                    <div className="mpt__row-item w-1/4 ">{examInfo.name}</div>
                    <div className="mpt__row-item w-1/12 ">{examInfo.point}</div>
                    <div className="mpt__row-item w-1/6 ">{minuteToTime(examInfo.timeMinutes)}</div>
                    <div className="mpt__row-item w-1/6 ">{examInfo.completed_Num}</div>
                    <div className="mpt__row-item w-1/12 ">{examInfo.isFull ? "Yes" : "No"}</div>
                    <div className="mpt__row-item w-1/6 flex items-center" onClick={(e) => e.stopPropagation()}>

                        {
                            !isTeacher &&
                            <>
                                <div className='flex-1 mr-[10px]'>
                                    {
                                        examInfo.isFull == false &&
                                        <button className='tei__btn-func ' onClick={handleAddQuestions}>
                                            Add
                                        </button>
                                    }
                                </div>
                                <div className='flex-1'>
                                    <button className='tei__btn-func delete' onClick={handleRemoveClick}>
                                        Remove
                                    </button>
                                </div>
                            </>
                        }
                    </div>
                </div>
            }

            {isLoading == true && <LoaderPage />}

            {isShowDetail == true && <ToeicDetailQuestion toeicInfo={examInfo} onShow={setIsShowDetail} />}
        </>
    )
}

function ToeicDetailQuestion({ toeicInfo, onShow }) {
    const [isLoading, setIsLoading] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowPerPage = 6;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(questions.length / rowPerPage);
    const getQuestions = async () => {
        try {
            setIsLoading(true);
            const response = await appClient.get(`api/QuesToeic/toeic/${toeicInfo.toeicId}/result`);
            const dataRes = response.data;
            if (dataRes.success) {
                setQuestions(dataRes.message.map((item, index) => ({ ...item, index: index + 1 })))
            }

            setIsLoading(false);
        }
        catch {
            setIsLoading(false);
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
        getQuestions();
    }, [])

    useEffect(() => {
        setSortedData(sortedDataFunc());
    }, [questions, sortConfig])

    return (
        <div className='fixed top-0 left-0 w-full h-full flex items-center justify-center tdq__wrapper z-[1000]' onClick={(e) => onShow(false)}>
            {
                isLoading == false &&
                <div className='w-[800px] h-[500px] flex flex-col bg-white rounded-[10px] shadow-md p-[20px]' onClick={(e) => e.stopPropagation()}>
                    <div className='tdq__title'>
                        {toeicInfo.name}
                    </div>

                    <div className="clb__tbl__wrapper mt-[20px]  flex-1">
                        <div className="mpt__header flex w-full items-center">
                            <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("index", event)}>Question</div>
                            <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("part", event)}>Type</div>
                            <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("level", event)}>Level</div>
                            <div className="mpt__header-item w-1/4" ></div>
                        </div>

                        <div className='mpt__body min-h-[320px] overflow-hidden mt-[10px]'>
                            {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                                return (
                                    <ToeicQuestionItem key={index} index={item.index} quesInfo={item} />
                                )
                            })}
                        </div>

                        <div className='flex justify-between items-center'>
                            <div className='flex items-center'>
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

                            <button className='tdq__btn-func' onClick={(e) => onShow(false)}>Close</button>
                        </div>
                    </div>
                </div>
            }

            {isLoading == true && <LoaderPage />}
        </div>
    )
}

function ToeicQuestionItem({ index, quesInfo }) {
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

    const handleClickViewAnswerInfor = (event) => {
        setIsShowQues(true);
    }

    const firstQuesNo = quesInfo.subQues[0].quesNo;
    const lastQuesNo = quesInfo.subQues[quesInfo.subQues.length - 1].quesNo;
    return (
        <>
            <div className='mpt__row flex items-center mb-[10px]' onClick={handleClickViewAnswerInfor}>
                <div className="mpt__row-item w-1/4 ">Question {firstQuesNo} {quesInfo.subQues.length > 1 && ` - ${lastQuesNo}`}</div>
                <div className="mpt__row-item w-1/4 ">{quesInfo.part_Name}</div>
                <div className="mpt__row-item w-1/4 ">{levelName}</div>
                <div className="mpt__row-item w-1/4 ">
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

export default QuestionToeicListBoard