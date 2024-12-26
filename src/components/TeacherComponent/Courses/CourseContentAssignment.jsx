import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import MaskedInput from 'react-text-mask';
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE } from '~/GlobalConstant.js';
import { AssignmentDetailListQues } from '../../AdminComponent/Course/CourseMainDetail/CourseContentAssignment';


function CourseContentAssignment() {
    const { contentId } = useParams();
    const [assignments, setAssignments] = useState([]);
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowPerPage = 6;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(assignments.length / rowPerPage);

    const getAssignment = async () => {
        try {
            const response = await appClient.get(`api/Assignments/content/${contentId}`);
            const dataRes = response.data;
            if (dataRes.success) {
                setAssignments(dataRes.message.map((item, index) => ({ ...item, index: index + 1 })));
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

    const removeVietnameseAccents = (str) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D");
    }


    const getValueByPath = (object, path) => {
        return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), object);
    };

    const sortedDataFunc = () => {
        if (sortConfig.length === 0) return [...assignments];

        return [...assignments].sort((a, b) => {
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
        getAssignment();
    }, [])

    useEffect(() => {
        setSortedData(sortedDataFunc());
    }, [assignments, sortConfig])

    useEffect(() => {
        if (searchValue != "") {
            setSortedData(prev => {
                let newPrev = prev.filter(item => {
                    const fullName = removeVietnameseAccents(item.title).toLowerCase();
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

    const handleReloadAssignment = () => {
        getAssignment();
    }

    return (
        <div className='ccp__wrapper px-[20px]'>
            <div className='flex justify-between items-center'>
                <div className='cmp__title'>List of Assignments</div>
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
                    <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("noNum", event)}>No</div>
                    <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("title", event)}>Title</div>
                    <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("time", event)}>Time</div>
                    <div className="mpt__header-item w-1/6" onClick={(event) => handleSort("achieved_Percentage", event)}>Pass Rate</div>
                    <div className="mpt__header-item w-1/6" onClick={(event) => handleSort("canViewResult", event)}>Allow View</div>
                    <div className="mpt__header-item w-1/12"></div>
                </div>

                <div className='mpt__body min-h-[350px] mt-[10px]'>
                    {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                        return (
                            <ContentAssignmentItem
                                assignmentInfo={item}
                                key={index}
                                index={item.index}
                                onReloadAssignment={handleReloadAssignment}
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

function ContentAssignmentItem({ index, assignmentInfo, onReloadAssignment }) {
    const [isShowDetail, setIsShowDetail] = useState(false);
    const handleRedirectToAssignment = () => {
        setIsShowDetail(true);
    }

    return (
        <>
            <div className={`mpt__row flex items-center mb-[10px]`} onClick={handleRedirectToAssignment}>
                <div className="mpt__row-item w-1/12 cci__row-item"># {assignmentInfo?.noNum}</div>
                <div className="mpt__row-item w-1/4 cci__row-item">{assignmentInfo?.title}</div>
                <div className="mpt__row-item w-1/4 cci__row-item">{assignmentInfo?.time}</div>
                <div className="mpt__row-item w-1/6 cci__row-item">{assignmentInfo?.achieved_Percentage}</div>
                <div className="mpt__row-item w-1/6 cci__row-item">{assignmentInfo?.canViewResult == true ? "Yes" : "No"}</div>
            </div>

            {isShowDetail && <AssignmentDetail onShow={setIsShowDetail} assignmentInfo={assignmentInfo} onReloadAssignment={onReloadAssignment}/>}
        </>
    )
}

function AssignmentDetail({ onShow, assignmentInfo, onReloadAssignment }) {
    const { contentId } = useParams();
    const [isCanShowResult, setIsCanShowResult] = useState(assignmentInfo.canViewResult);
    const inputTitleRef = useRef(null);
    const inputTimeRef = useRef(null);
    const inputPassRef = useRef(null);
    const inputOrderRef = useRef(null);
    const timeMask = [/\d/, /\d/, ':', /\d/, /\d/, ':', /\d/, /\d/];

    const handleChangeOrder = (event) => {
        if (inputOrderRef.current) {
            inputOrderRef.current.value = event.target.value.replace(/[^0-9]/g, '');
        }
    }

    const handleChangePassRate = (event) => {
        const value = event.target.value.replace(/[^0-9]/g, '');
        const numericValue = parseInt(value, 10);

        if (numericValue >= 0 && numericValue <= 100) {
            if (inputPassRef.current) {
                inputPassRef.current.value = numericValue;
            }
        } else {
            if (inputPassRef.current) {
                inputPassRef.current.value = '';
            }
        }
    }

    const handleClickClose = (event) => {
        event.preventDefault();
        onShow(false);
    }

    useEffect(() => {
        inputTitleRef.current.value = assignmentInfo.title;
        inputTimeRef.current.inputElement.value = assignmentInfo.time;
        inputOrderRef.current.value = assignmentInfo.noNum;
        inputPassRef.current.value = assignmentInfo.achieved_Percentage;

    }, [assignmentInfo])

    return (
        <div className='fixed top-0 left-0 w-full h-full z-[1000] flex items-center justify-center bg-gray-400 bg-opacity-20' onClick={(e) => onShow(false)}>
            <div className='w-[800px] h-[600px] p-[20px] bg-white rounded-[10px] shadow-lg' onClick={(e) => e.stopPropagation()}>
                <div className='ad__info__wrapper flex flex-col'>
                    <div className='flex justify-between'>
                        <input
                            className={`ad__info--title`}
                            name='Title'
                            ref={inputTitleRef}
                            readOnly={true}
                        />

                        <div className="flex">
                            <button className='ad__info-btn' onClick={handleClickClose}>Close</button>
                        </div>
                    </div>

                    <input className='hidden' name='ContentId' value={contentId} readOnly />
                    <div className='flex mt-[10px]'>
                        <div className='flex items-center flex-1'>
                            <div className='ad__info--text'>Time: </div>
                            <MaskedInput
                                name='Time'
                                mask={timeMask}
                                placeholder="00:00:00"
                                defaultValue={"00:00:00"}
                                className={`ad__info--input`}
                                ref={inputTimeRef}
                                readOnly={true}
                            />
                        </div>

                        <div className='flex items-center flex-1'>
                            <div className='ad__info--text'>Pass Rate: </div>
                            <input
                                ref={inputPassRef}
                                className={`ad__info--input`}
                                name='Achieved_Percentage'
                                readOnly={true}
                                onChange={handleChangePassRate}
                            />
                        </div>
                    </div>

                    <div className='flex mt-[10px]'>
                        <div className='flex items-center flex-1'>
                            <div className='ad__info--text'>Order: </div>
                            <input
                                ref={inputOrderRef}
                                className={`ad__info--input`}
                                name='NoNum'
                                readOnly={true}
                                onChange={handleChangeOrder}
                            />

                        </div>

                        <div className="flex items-center flex-1">
                            <div className='ad__info--text'>Allow View: </div>

                            <div className='flex items-center justify-start flex-1'>
                                <div className='flex items-center '>
                                    <input type='radio' name='CanViewResult' disabled={true} value={false} id='allow-view-yes' checked={isCanShowResult == 0} onChange={(e) => setIsCanShowResult(0)} />
                                    <label className='aab__title-lbl' htmlFor='allow-view-yes'>Yes</label>
                                </div>

                                <div className='flex items-center ml-[90px]'>
                                    <input type='radio' name='CanViewResult' disabled={true} value={true} id='allow-view-no' checked={isCanShowResult == 1} onChange={(e) => setIsCanShowResult(1)} />
                                    <label className='aab__title-lbl' htmlFor='allow-view-no'>No</label>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className='ad__info-ques__wrapper'>
                    <AssignmentDetailListQues assignmentId={assignmentInfo.assignmentId} isTeacher={true} />
                </div>
            </div>
        </div>
    )
}

export default CourseContentAssignment