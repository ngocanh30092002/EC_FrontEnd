import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import { appClient } from '~/AppConfigs';
import { CreateRandom } from '@/helper/RandomHelper';

function ScorePage() {
    const { classId } = useParams();
    const navigate = useNavigate();
    const [scoreRecords, setScoreRecords] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const rowPerPage = 6;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(scoreRecords.length / rowPerPage);

    const getPendingEnroll = async () => {
        try {
            const response = await appClient.get(`api/ScoreHistory/classes/${classId}`);
            const dataRes = response.data;
            if (dataRes.success) {
                setScoreRecords(dataRes.message.map((item, index) => ({ ...item, index })));
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

    const handleDeleteEnroll = (enrollId) => {
        let newEnrolls = scoreRecords.filter(e => e.enrollId != enrollId);
        newEnrolls = newEnrolls.map((item, index) => ({ ...item, index: index + 1 }));
        setScoreRecords(newEnrolls);
    }

    useEffect(() => {
        if (classId == null) {
            navigate("admin")
            return;
        }

        getPendingEnroll();
    }, [])

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
        if (sortConfig.length === 0) return [...scoreRecords];

        return [...scoreRecords].sort((a, b) => {
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
    }, [scoreRecords, sortConfig])

    useEffect(() => {
        if (searchValue != "") {
            setSortedData(prev => {
                let newPrev = prev.filter(item => {
                    const fullName = removeVietnameseAccents(item.userInfo.firstName + " " + item.userInfo.lastName).toLowerCase();
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
        <div className='er__wrapper'>
            <div className="flex justify-end items-center mb-[20px]">
                <div className='mpt__header-item--search-icon'>
                    <img src={IMG_URL_BASE + "search_icon.svg"} className='w-[30px] p-[6px]' />
                </div>
                <input placeholder='Search ...' className='mpt__header-item--search' value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
            </div>
            <div className='er__tbl__wrapper px-[20px]'>
                <div className='mpt__header flex w-full'>
                    <div className="mpt__header-item w-1/6" onClick={(event) => handleSort("index", event)}>No</div>
                    <div className="mpt__header-item w-1/3" onClick={(event) => handleSort("userBackground.userName", event)}>Student Info</div>
                    <div className="mpt__header-item w-1/6" onClick={(event) => handleSort("entrance_Point", event)}>Entrance Point</div>
                    <div className="mpt__header-item w-1/6" onClick={(event) => handleSort("midterm_Point", event)}>Midterm Point</div>
                    <div className="mpt__header-item w-1/6" onClick={(event) => handleSort("final_Point", event)}>Final Point</div>
                </div>

                <div className='mpt__body min-h-[390px] mt-[10px]'>
                    {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                        return (
                            <ScoreItem scoreInfo={item} key={index} index={item.index} onDeleteItem={handleDeleteEnroll} />
                        )
                    })}

                    {sortedData.length == 0 &&
                        <div className='w-full h-[390px] flex items-center justify-center'>
                            <span className='er__no-enrolls'>There are no score records at this time.</span>
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


function ScoreItem({ scoreInfo, index, onDeleteItem }) {
    const [isShowDetail, setIsShowDetail] = useState(false);

    const handleViewResult = () => {
        setIsShowDetail(true);
    }

    return (
        <>
            <div className={`mpt__row flex items-center mb-[10px]`} onClick={handleViewResult}>
                <div className="mpt__row-item w-1/6"># {index + 1}</div>
                <div className="mpt__row-item w-1/3 flex items-center">
                    <div>
                        <img src={scoreInfo?.userBackground?.image == null || scoreInfo?.userBackground?.image == ""  ? IMG_URL_BASE + "unknown_user.jpg" : APP_URL + scoreInfo.userBackground.image} className='w-[45px] h-[45px] rounded-[10px] object-cover' />
                    </div>
                    <div className='flex-1 flex flex-col items-start'>
                        <div className='line-clamp-1 cabf__ti--text'>{scoreInfo.userInfo.firstName} {scoreInfo.userInfo.lastName}</div>
                        <div className='line-clamp-1 si__user-name'># {scoreInfo.userInfo.userName}</div>
                    </div>
                </div>
                <div className="mpt__row-item w-1/6">{scoreInfo.entrance_Point}</div>
                <div className="mpt__row-item w-1/6">{scoreInfo.midterm_Point}</div>
                <div className="mpt__row-item w-1/6">{scoreInfo.final_Point}</div>
            </div>

            {isShowDetail && <ScoreViewDetail onShow={setIsShowDetail} scoreInfo={scoreInfo} />}
        </>
    )
}

function ScoreViewDetail({ onShow, scoreInfo }) {
    const navigate = useNavigate();
    const [examInfos, setExamInfos] = useState([]);
    const { classId } = useParams();
    const getProcessExamIds = async () => {
        try {
            const response = await appClient.get(`api/LearningProcesses/enrollments/${scoreInfo.enrollId}/exam-info?classId=${classId}`);
            const dataRes = response.data;
            if (dataRes.success) {
                setExamInfos(dataRes.message);
            }
        }
        catch {

        }
    }

    const handleViewExam = (item) => {
        const sessionId = CreateRandom();
        const sessionExamId = CreateRandom();
        sessionStorage.setItem(sessionExamId, btoa(item.examination.examId));
        sessionStorage.setItem(sessionId, scoreInfo.enrollId);
        navigate(`/examination?examId=${sessionExamId}&id=${sessionId}&type=1`)
    }

    useEffect(() => {
        if (classId == null) {
            navigate(-1);
            return;
        }

        getProcessExamIds();
    }, [])


    return (
        <div className='fixed top-0 left-0 w-full z-[1000] h-full flex justify-center items-center svd__wrapper' onClick={(e) => onShow(false)}>
            <div className='w-[800px] h-[620px] bg-white rounded-lg p-[20px] flex flex-col' onClick={(e) => e.stopPropagation()}>
                {
                    examInfos.length != 0 &&
                    <div className="flex-1">
                        {examInfos.map((item, index) => {
                            return (
                                <div key={index} className='p-[10px] border rounded-[4px] mb-[10px]'>
                                    <div className='svd__title'>{item.examination.title}</div>
                                    <ScoreBoard dataInfo={item.toeicScore} />

                                    <div className='flex justify-end mt-[10px]'>
                                        <button className='svd__btn' onClick={(e) => handleViewExam(item)}>View</button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                }

                {
                    examInfos.length == 0 &&
                    <div className='flex-1 flex items-center justify-center svd__title-empty'>The system has not recorded any exam information yet</div>
                }

                <div className='flex justify-end'>
                    <button className='svd__btn' onClick={(e) => onShow(false)}>Close</button>
                </div>
            </div>
        </div>
    )
}

function ScoreBoard({ dataInfo }) {
    return (
        <div className='flex justify-between'>
            {Object.keys(dataInfo).map((key, index) => {
                return (
                    <div className='flex flex-col items-center flex-1 border border-l-0 first-of-type:border-l mt-[10px]'>
                        <div className='sb__title'>{key}</div>
                        <div className='sb__point'>{dataInfo[key]}</div>
                    </div>
                )
            })}
        </div>
    )
}
export default ScorePage