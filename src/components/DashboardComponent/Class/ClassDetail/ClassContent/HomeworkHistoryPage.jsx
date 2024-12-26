import React, { useEffect, useState } from 'react'
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import { appClient } from '~/AppConfigs';
import { CreateRandom } from '@/helper/RandomHelper';
import { useNavigate } from 'react-router-dom';

function HomeworkHistoryPage({ enrollId }) {
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [hwSubmissions, setHwSubmissions] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowPerPage = 6;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(hwSubmissions.length / rowPerPage);



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
        if (sortConfig.length === 0) return [...hwSubmissions];

        return [...hwSubmissions].sort((a, b) => {
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

    const getSubmissionHomework = async () => {
        try {
            const response = await appClient.get(`api/HwSubmission/enrolls/${enrollId}/his`);
            const dataRes = response.data;
            if (dataRes.success) {
                setHwSubmissions(dataRes.message.map((item, index) => ({ ...item, index: index + 1 })));
            }
        }
        catch {

        }
    }

    const removeVietnameseAccents = (str) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D");
    }

    useEffect(() => {
        getSubmissionHomework();
    }, []);

    useEffect(() => {
        setSortedData(sortedDataFunc());
    }, [hwSubmissions, sortConfig])

    useEffect(() => {
        if (searchValue != "") {
            setSortedData(prev => {
                let newPrev = prev.filter(item => {
                    const fullName = removeVietnameseAccents(item.homework.title).toLowerCase();
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

    return (
        <div className='hhp__wrapper p-[20px]'>
            <div className='flex justify-between items-center'>
                <div className='cmp__title'>List of homework submission</div>
                <div className="flex items-center">
                    <div className="flex items-center">
                        <div className='mpt__header-item--search-icon'>
                            <img src={IMG_URL_BASE + "search_icon.svg"} className='w-[30px] p-[6px]' />
                        </div>
                        <input placeholder='Search ...' className='mpt__header-item--search' value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                    </div>
                </div>
            </div>

            <div className="clb__tbl__wrapper mt-[20px]">
                <div className="mpt__header flex w-full">
                    <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("index", event)}>No</div>
                    <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("classId", event)}>Homework Info</div>
                    <div className="mpt__header-item w-1/6" onClick={(event) => handleSort("teacher.fullName", event)}>Deadline</div>
                    <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("teacher.fullName", event)}>Late</div>
                    <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("startDate", event)}>Score</div>
                    <div className="mpt__header-item w-1/6" onClick={(event) => handleSort("endDate", event)}>Feed Back</div>
                    <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("status", event)}>Status</div>
                    <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("status", event)}>Pass</div>
                </div>

                <div className='mpt__body min-h-[480px] mt-[10px]'>
                    {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                        return (
                            <HwSubmissionItem
                                submitInfo={item}
                                key={index}
                                index={item.index}
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
    )
}

function HwSubmissionItem({ submitInfo, index}) {
    const navigate = useNavigate();
    const handleViewResultHw = () => {
        if (submitInfo.homework.type == 1) {
            const sessionId = CreateRandom();
            sessionStorage.setItem(sessionId, submitInfo.submissionId);
            navigate(`/assignment/prepare-homework?id=${sessionId}`)
        }
        else {
            const sessionId = CreateRandom();
            sessionStorage.setItem(sessionId, submitInfo.submissionId);
            navigate(`/examination/prepare-homework?id=${sessionId}&mode=view-answer`)
        }
    }
    return (
        <div className={`mpt__row flex items-center mb-[10px]`} onClick={handleViewResultHw}>
            <div className="mpt__row-item w-1/12 "># {index}</div>
            <div className="mpt__row-item w-1/4 flex">
                <div>
                    <img src={submitInfo?.homework?.image ? APP_URL + submitInfo.homework?.image : IMG_URL_BASE + "unknown_user.jpg"} className='w-[45px] h-[45px] rounded-[10px] object-cover' />
                </div>
                <div className='flex-1 flex flex-col justify-between'>
                    <div className='line-clamp-1 hsi__item-text'>{submitInfo?.homework?.title}</div>
                    <div className='line-clamp-1 hsi__item-text !text-[12px]'>{submitInfo?.date}</div>
                </div>
            </div>
            <div className="mpt__row-item w-1/6 flex flex-col justify-between">
                <div className='hsi__item-time'>{submitInfo.homework.startTime}</div>
                <div className='hsi__item-time'>{submitInfo.homework.endTime}</div>
            </div>
            <div className='mpt__row-item w-1/12'>{submitInfo.homework.lateSubmitDays}</div>
            <div className="mpt__row-item w-1/12">
                <div className='hsi__item-score'>
                    <span className='px-[4px]'>{submitInfo.score.correct}</span>
                    /
                    <span className='px-[4px]'>{submitInfo.score.total}</span>

                </div>
            </div>
            <div className="mpt__row-item w-1/6 ">{submitInfo.feedBack}</div>
            <div className="mpt__row-item w-1/12 ">
                <div className={`hsi__item-status ${submitInfo.status}`}>
                    {submitInfo.status}
                </div>

            </div>
            <div className="mpt__row-item w-1/12 ">
                <div className={`hsi__item-status-hw ${submitInfo.isPass ? "pass" : "fail"}`}>
                    {submitInfo.isPass ? "Passed" : "Failed"}
                </div>
            </div>
        </div>
    )
}

export default HomeworkHistoryPage