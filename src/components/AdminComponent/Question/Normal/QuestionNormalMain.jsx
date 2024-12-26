import React, { useEffect, useRef, useState } from 'react'
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import LoaderPage from '../../../LoaderComponent/LoaderPage';
import toast from './../../../../helper/Toast';
import { Route, Routes, useNavigate } from 'react-router-dom';
import QuestionAddBoard from './QuestionAddBoard';

function QuestionNormalMain() {
    return(
        <Routes>
            <Route path='/' element={<QuestionNormal/>}/>
            <Route path='/:type/add-ques' element={<QuestionAddBoard/>}/>
        </Routes>
    )
}

function QuestionNormal() {
    const [queInfos, setQueInfos] = useState([]);
    const [isShowAddBoard, setIsShowBoard] = useState(false);
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowPerPage = 7;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(queInfos.length / rowPerPage);

    const getQueInfos = async () => {
        try {
            const response = await appClient.get("api/homeques/types/num-ques");
            const dataRes = response.data;

            if (dataRes.success) {
                setQueInfos(dataRes.message.map((item, index) => ({ ...item, index: index + 1 })));
            }
        }
        catch {

        }
    }

    useEffect(() => {
        getQueInfos();
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


    const handleReloadQuesInfo = () => {
        getQueInfos();
    }

    return (
        <div className='clb__wrapper px-[20px]'>
            <div className="clb__tbl__wrapper mt-[20px] ">
                <div className="mpt__header flex w-full items-center">
                    <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("index", event)}>No</div>
                    <div className="mpt__header-item w-1/2" onClick={(event) => handleSort("name", event)}>Question Name</div>
                    <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("num", event)}>Quantity</div>
                    <div className="mpt__header-item w-1/6"></div>
                </div>

                <div className='mpt__body min-h-[480px] mt-[10px]'>
                    {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                        return (
                            <QuestionTypeItem quesInfo={item} index={item.index} key={index} />
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

function QuestionTypeItem({ quesInfo, index }) {
    const navigate = useNavigate();
    const [isShowDetail, setIsShowDetail] = useState(false);
    const handleShowQuestions = () => {
        setIsShowDetail(true);
    }

    const handleAddQuestion = (event) =>{
        event.preventDefault();
        navigate(`${quesInfo.name}/add-ques`)
    }

    return (
        <>
            <div className={`mpt__row flex items-center mb-[10px]`} onClick={handleShowQuestions}>
                <div className="mpt__row-item w-1/12 "># {index}</div>
                <div className="mpt__row-item w-1/2 ">Question {quesInfo.name}</div>
                <div className="mpt__row-item w-1/4 ">{quesInfo.num}</div>
                <div className="mpt__row-item w-1/6 justify-end flex" onClick={(e) => e.stopPropagation()}>
                    <button className='qti__btn-func p-[5px] transition-all duration-300 rounded-[10px]' onClick={handleAddQuestion}>
                        <img src={IMG_URL_BASE + "plus-icon.svg"} className='w-[20px]' />
                    </button>
                </div>
            </div>

            {isShowDetail && <QuestionTypeDetail type={quesInfo.name} onShow={setIsShowDetail} />}
        </>
    )
}

function QuestionTypeDetail({ type, onShow }) {
    const [isLoading, setIsLoading] = useState(false);
    const [apiPath, setApiPath] = useState("");
    const [questions, setQuestions] = useState([]);
    const [isShowAddBoard, setIsShowBoard] = useState(false);
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowPerPage = 6;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(questions.length / rowPerPage);

    const getQuestionInfo = async (api) => {
        try {
            setIsLoading(true);
            let response = await appClient.get(api);
            let dataRes = response.data;
            if (dataRes.success) {
                setQuestions(dataRes.message.map((item, index) => ({ ...item, index: index + 1 })));

                setIsLoading(false);
                setTimeout(() => {
                }, 1000);
            }
        }
        catch {

        }
    }

    useEffect(() => {
        let api = undefined;
        if (type == "Image") {
            api = "api/lc-images"
        }
        else if (type == "Audio") {
            api = "api/lc-audios"
        }
        else if (type == "Conversation") {
            api = "api/lc-con"
        }
        else if (type == "Sentence") {
            api = "api/rc-sentence"
        }
        else if (type == "Single") {
            api = "api/rc-single"
        }
        else if (type == "Double") {
            api = "api/rc-double"
        }
        else {
            api = "api/rc-triple"
        }

        setApiPath(api);

        getQuestionInfo(api);
    }, [type])

    const handleDeleteQues = (id) => {
        let newQuestions = questions.filter(q => q.id != id);
        newQuestions = newQuestions.map((item, index) => ({ ...item, index: index + 1 }));
        setQuestions(newQuestions);
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
        setSortedData(sortedDataFunc());
    }, [questions, sortConfig])


    return (
        <div className='fixed w-full flex items-center justify-center h-full top-0 left-0 qtd__wrapper z-[1000]' onClick={(e) => onShow(false)}>
            {
                isLoading == false &&
                <div className='w-[1000px] rounded-[10px] flex flex-col bg-white p-[20px]' onClick={(e) => e.stopPropagation()}>
                    <div className='qtd__title'>Question {type}</div>

                    <div className="clb__tbl__wrapper flex-1 flex flex-col mt-[20px] ">
                        <div className="mpt__header flex w-full items-center">
                            <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("index", event)}>Question</div>
                            <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("point", event)}>Time</div>
                            <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("point", event)}>Level</div>
                            <div className="mpt__header-item w-1/4"></div>
                        </div>

                        <div className='mpt__body min-h-[370px] mt-[10px]'>
                            {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                                return (
                                    <QuestionTypeDetailItem
                                        dataInfo={item}
                                        key={index}
                                        index={item.index}
                                        apiPath={apiPath}
                                        onDeleteQues={handleDeleteQues}
                                        type={type} />
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
            }

            {isLoading == true && <LoaderPage />}
        </div>
    )
}

function QuestionTypeDetailItem({ index, dataInfo, apiPath, onDeleteQues, type }) {
    const [isShowDetail, setIsShowDetail] = useState(false);

    let level = dataInfo.level;
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

    const handleDeleteQues = async (event) => {
        event.preventDefault();
        try {
            const confirmAnswer = confirm("Do you want to delete ?");
            if (confirmAnswer) {
                var response = await appClient.delete(`${apiPath}/${dataInfo.id}`);
                if (response.data.success) {
                    toast({
                        type: "success",
                        title: "Success",
                        message: "Delete question successfully",
                        duration: 4000
                    });

                    onDeleteQues(dataInfo.id);
                }
            }
        }
        catch {

        }
    }

    const handleViewQuestions = (event) => {
        setIsShowDetail(true);
    }
    return (
        <>
            <div className={`mpt__row flex items-center mb-[10px]`} onClick={handleViewQuestions}>
                <div className="mpt__row-item w-1/4 ">Question {index}</div>
                <div className="mpt__row-item w-1/4 ">{dataInfo.time}</div>
                <div className="mpt__row-item w-1/4 ">{levelName}</div>
                <div className="mpt__row-item w-1/4 flex justify-end" onClick={(e) => e.stopPropagation()}>
                    <button className='p-[8px] qtdi__btn-remove transition-all duration-500 rounded-[8px]' onClick={handleDeleteQues}>
                        <img src={IMG_URL_BASE + "trash_icon.svg"} className='w-[15px]' />
                    </button>
                </div>
            </div>

            {isShowDetail &&
                <>
                    {type == "Image" && <QuestionImage queInfo={dataInfo} onShow={setIsShowDetail} />}
                    {type == "Audio" && <QuestionAudio queInfo={dataInfo} onShow={setIsShowDetail} />}
                    {type == "Conversation" && <QuestionConversation queInfo={dataInfo} onShow={setIsShowDetail} />}
                    {type == "Sentence" && <QuestionSentence queInfo={dataInfo} onShow={setIsShowDetail} />}
                    {type == "Single" && <QuestionSingle queInfo={dataInfo} onShow={setIsShowDetail} />}
                    {type == "Double" && <QuestionDouble queInfo={dataInfo} onShow={setIsShowDetail} />}
                    {type == "Triple" && <QuestionTriple queInfo={dataInfo} onShow={setIsShowDetail} />}
                </>
            }
        </>
    )
}


function QuestionImage({ queInfo, onShow }) {
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
        <div className='fixed top-0 left-0 w-full h-full qi__wrapper flex items-center justify-center' onClick={(e) => onShow(false)}>
            <div className='w-[1200px] h-[600px] rounded-[10px] shadow-lg bg-white' onClick={(e) => e.stopPropagation()}>
                <div className='grid grid-cols-12 h-full gap-[20px] p-[20px]'>
                    <div className='col-span-5'>
                        <img src={APP_URL + queInfo.imageUrl} className='w-full h-full object-cover rounded-[8px]' />
                    </div>
                    <div className='col-span-7 flex flex-col'>
                        <div className='flex flex-col flex-1'>
                            {Object.keys(answerInfo).filter((key) => key.startsWith("answer"))
                                .map((key, index) => (
                                    <div className='flex items-center qa__wrapper' key={index}>
                                        <input type='radio' name='answerRdo' disabled checked={key.replace("answer", "") == selectedAnswer} className='qa__rdo mr-[10px]' />
                                        <div className='qi__title-text'>{key.replace("answer", "")}</div>
                                        <div className='qi__ques-info'>{queInfo.answerInfo[key]}</div>
                                    </div>
                                ))}
                        </div>

                        <div className='flex justify-between  items-center mt-[20px]'>
                            <audio controls preload='auto' className='w-[400px]' ref={audioRef}>
                                <source src={APP_URL + queInfo.audioUrl} type="audio/mpeg" />
                            </audio>

                            <button className='qtdi__close-btn' onClick={(e) => onShow(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

function QuestionAudio({ queInfo, onShow }) {
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
        <div className='fixed top-0 left-0 w-full h-full qi__wrapper flex items-center justify-center' onClick={(e) => onShow(false)}>
            <div className='w-[1200px] rounded-[10px] shadow-lg bg-white' onClick={(e) => e.stopPropagation()}>
                <div className='flex p-[20px] flex-col'>
                    <div className='flex items-center py-[20px]'>
                        <div className='qa__title-text !font-bold'>Question: </div>
                        <div className='qa__ques-info !font-bold !p-0 !min-h-0'>{queInfo?.question}</div>
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


                    <div className='flex justify-between items-center mt-[20px]'>
                        <audio controls preload='auto' className='w-[400px]' ref={audioRef}>
                            <source src={APP_URL + queInfo?.audioUrl} type="audio/mpeg" />
                        </audio>


                        <button className='qtdi__close-btn' onClick={(e) => onShow(false)}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function QuestionConversation({ queInfo, onShow }) {
    const audioRef = useRef(null);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.load();
        }
    }, [queInfo.audioUrl]);

    return (
        <div className='fixed top-0 left-0 w-full h-full qi__wrapper flex items-center justify-center' onClick={(e) => onShow(false)}>
            <div className='w-[1200px] h-[600px] rounded-[10px] shadow-lg bg-white' onClick={(e) => e.stopPropagation()}>
                <div className='flex p-[20px] w-full h-full flex-col'>
                    <div className='grid grid-cols-2 gap-[20px] flex-1'>
                        <div>
                            {
                                queInfo.imageUrl != "" &&
                                <div className='flex justify-center'>
                                    <img src={APP_URL + queInfo?.imageUrl} className='w-full object-cover rounded-[8px]' />
                                </div>
                            }
                        </div>

                        <div className=''>
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

                    <div className='flex justify-between items-center'>
                        <audio controls preload='auto' className='w-[400px]' ref={audioRef}>
                            <source src={APP_URL + queInfo?.audioUrl} type="audio/mpeg" />
                        </audio>

                        <button className='qtdi__close-btn' onClick={(e) => onShow(false)}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function QuestionSentence({ queInfo, onShow }) {
    const [selectedAnswer, setSelectedAnswer] = useState(queInfo.answerInfo.correctAnswer);

    useEffect(() => {
        setSelectedAnswer(queInfo.answerInfo.correctAnswer);
    }, [queInfo])

    return (
        <div className='fixed top-0 left-0 w-full h-full qi__wrapper flex items-center justify-center' onClick={(e) => onShow(false)}>
            <div className='w-[1200px]  rounded-[10px] shadow-lg bg-white' onClick={(e) => e.stopPropagation()}>
                <div className='flex p-[20px] flex-col'>
                    <div className='flex items-center qa__wrapper py-[20px]'>
                        <div className='qa__title-text !font-bold'>Question: </div>
                        <div className='qa__ques-info !font-bold !p-0 !min-h-0'>{queInfo?.question}</div>
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

                    <div className='flex justify-end'>
                        <button className='qtdi__close-btn' onClick={(e) => onShow(false)}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function QuestionSingle({ queInfo, onShow }) {
    return (
        <div className='fixed top-0 left-0 w-full h-full qi__wrapper flex items-center justify-center' onClick={(e) => onShow(false)}>
            <div className='w-[1200px] h-[600px] rounded-[10px] shadow-lg bg-white' onClick={(e) => e.stopPropagation()}>
                <div className='flex p-[20px] w-full h-full flex-col'>
                    <div className='grid grid-cols-2 gap-[20px] flex-1'>
                        <div>
                            {
                                queInfo.imageUrl != "" &&
                                <div>
                                    <img src={APP_URL + queInfo?.imageUrl} className='w-full object-cover rounded-[8px]' />
                                </div>
                            }
                        </div>

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

                    <div className='flex justify-end mt-[10px]'>
                        <button className='qtdi__close-btn' onClick={(e) => onShow(false)}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function QuestionDouble({ queInfo, onShow }) {
    return (
        <div className='fixed top-0 left-0 w-full h-full qi__wrapper flex items-center justify-center' onClick={(e) => onShow(false)}>
            <div className='w-[1200px] h-[600px] rounded-[10px] shadow-lg bg-white' onClick={(e) => e.stopPropagation()}>
                <div className='flex p-[20px] w-full h-full flex-col'>
                    <div className='grid grid-cols-2 gap-[20px] flex-1'>
                        <div>
                            {
                                queInfo.imageUrl != "" &&
                                <div className='flex flex-col'>
                                    <img src={APP_URL + queInfo?.imageUrl_1} className='w-full object-cover rounded-[8px]' />
                                    <img src={APP_URL + queInfo?.imageUrl_2} className='w-full object-cover mt-[10px]' />
                                </div>
                            }
                        </div>

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

                    <div className='flex justify-end mt-[10px]'>
                        <button className='qtdi__close-btn' onClick={(e) => onShow(false)}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function QuestionTriple({ queInfo, onShow }) {
    return (
        <div className='fixed top-0 left-0 w-full h-full qi__wrapper flex items-center justify-center' onClick={(e) => onShow(false)}>
            <div className='w-[1200px] h-[600px] rounded-[10px] shadow-lg bg-white' onClick={(e) => e.stopPropagation()}>
                <div className='flex p-[20px] w-full h-full flex-col'>
                    <div className='grid grid-cols-2 gap-[20px] flex-1'>
                        <div>
                            {
                                queInfo.imageUrl != "" &&
                                <div className='flex flex-col'>
                                    <img src={APP_URL + queInfo?.imageUrl_1} className='w-full object-cover rounded-[8px]' />
                                    <img src={APP_URL + queInfo?.imageUrl_2} className='w-full object-cover mt-[10px]' />
                                    <img src={APP_URL + queInfo?.imageUrl_3} className='w-full object-cover mt-[10px]' />
                                </div>
                            }
                        </div>

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

                    <div className='flex justify-end mt-[10px]'>
                        <button className='qtdi__close-btn' onClick={(e) => onShow(false)}>
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default QuestionNormalMain