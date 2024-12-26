import toast from '@/helper/Toast';
import React, { useEffect, useRef, useState } from 'react';
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import AddReportBoard from './AddReportBoard';
import "./IssueReportStyle.css";
import DropDownList from '../../CommonComponent/DropDownList';

function IssueReportPage() {
    const [searchValue, setSearchValue] = useState("");
    const [isShowBoard, setIsShowBoard] = useState(false);
    const [reports, setReports] = useState([]);

    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const rowPerPage = 6;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(reports.length / rowPerPage);

    const handleGetReports = async () => {
        try {
            let response = await appClient.get("api/IssueReports/user");
            let dataRes = response.data;
            if (dataRes.success) {
                setReports(dataRes.message.map((item, index) => ({ ...item, index: index + 1 })));
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

    const getValueByPath = (object, path) => {
        return path.split('.').reduce((acc, key) => (acc ? acc[key] : undefined), object);
    };

    const sortedDataFunc = () => {
        if (sortConfig.length === 0) return [...reports];

        return [...reports].sort((a, b) => {
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

    const handleDeleteReport = (id) => {
        var newReports = reports.filter(r => r.issueId != id);
        newReports = newReports.map((item, index) => ({ ...item, index: index + 1 }));
        setReports(newReports);
    }

    useEffect(() => {
        handleGetReports();
    }, [])

    useEffect(() => {
        setSortedData(sortedDataFunc());
    }, [reports, sortConfig])

    useEffect(() => {
        if (searchValue != "") {
            setSortedData(prev => {
                const newPrev = prev.filter(item => item.title.toLowerCase().includes(searchValue.toLowerCase()));
                return newPrev;
            })
        }
        else {
            setSortedData(sortedDataFunc());
        }
    }, [searchValue])

    return (
        <div className=' w-full h-full p-[20px]'>
            <div className='flex justify-end'>
                <div className='flex items-center'>
                    <div className='irp__icon-search'>
                        <img src={IMG_URL_BASE + "search_icon.svg"} className='w-[30px] p-[6px]' />
                    </div>
                    <input placeholder='Search reports ...' className='irp__input-search' value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                </div>

                <button className='irp__btn-add' onClick={(e) => setIsShowBoard(!isShowBoard)}>
                    {
                        !isShowBoard ?
                            "Add Report"
                            :
                            "Hide Board"
                    }
                </button>
            </div>

            <AddReportBoard isShow={isShowBoard} onShow={setIsShowBoard} onReloadReport={handleGetReports}/>

            <div className='clb__wrapper'>
                <div className="clb__tbl__wrapper mt-[20px]">
                    <div className="mpt__header flex w-full">
                        <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("index", event)}>No</div>
                        <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("title", event)}>Title</div>
                        <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("description", event)}>Description</div>
                        <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("type", event)}>Type</div>
                        <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("status", event)}>Status</div>
                        <div className="mpt__header-item w-1/6" onClick={(event) => handleSort("createdAt", event)}>Created At</div>
                        <div className="mpt__header-item w-1/12"></div>
                    </div>

                    <div className='mpt__body min-h-[390px] mt-[10px]'>
                        {sortedData.slice(indexFirstItem, indexLastItem).map((item, index) => {
                            return (
                                <IssueReportItem
                                    index={item.index}
                                    reportInfo={item}
                                    key={index}
                                    onDeleteReport={handleDeleteReport}
                                    onReloadIssue={handleGetReports} />
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

function IssueReportItem({ index, reportInfo, onDeleteReport, onReloadIssue }) {
    const [isEditing, setIsEditing] = useState(false);
    const [isShowDetailResponse, setIsShowDetailResponse] = useState(false);

    const handleShowResponse = () => {
        setIsShowDetailResponse(true);
    }

    const handleRemoveReport = async (event) => {
        event.preventDefault();
        try {
            var confirmAnswer = confirm("Are you sure to delete this report");
            if (!confirmAnswer) return;

            const response = await appClient.delete(`api/IssueReports/${reportInfo.issueId}`);
            const dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Successfully",
                    message: "Delete report successfully",
                    duration: 4000
                });

                onDeleteReport(reportInfo.issueId);
                onReloadIssue();
                return;
            }
        }
        catch {

        }
    }

    return (
        <>
            <div className={`mpt__row flex items-center mb-[10px]`} onClick={handleShowResponse}>
                <div className="mpt__row-item w-1/12 !text-[12px]"># {index}</div>
                <div className="mpt__row-item w-1/4 !text-[12px]">{reportInfo.title}</div>
                <div className="mpt__row-item w-1/4 !text-[12px] line-clamp-2 ">{reportInfo.description}</div>
                <div className="mpt__row-item w-1/12  !text-[12px]">{reportInfo.typeName}</div>
                <div className="mpt__row-item w-1/12 !text-[12px] ">{reportInfo.statusName}</div>
                <div className="mpt__row-item w-1/6 !text-[12px] ">{reportInfo.createdAt}</div>
                <div className="mpt__row-item w-1/12 flex justify-end" onClick={(e) => e.stopPropagation()}>
                    <button onClick={handleRemoveReport}>
                        <img src={IMG_URL_BASE + "close.svg"} className='w-[30px] p-[5px]' />
                    </button>
                </div>
            </div>

            {isShowDetailResponse && <IssueDetailResponse reportInfo={reportInfo} onShow={setIsShowDetailResponse} onReloadIssue={onReloadIssue} />}
        </>
    )
}

function IssueDetailReport({ reportInfo, onShow, onReloadIssue }) {
    const [isEditing, setIsEditing] = useState(false);
    const [selectedType, setSelectedType] = useState(null);
    const [indexType, setIndexType] = useState(0);

    const [types, setTypes] = useState([]);

    const getIssueTypes = async () => {
        try {
            let response = await appClient.get("api/IssueReports/type");
            let dataRes = response.data;
            if (dataRes.success) {
                setTypes(dataRes.message);
                setSelectedType(dataRes.message[0]);
                setIndexType(0);
            }
        }
        catch {

        }
    }

    const inputTitleRef = useRef(null);
    const inputDesRef = useRef(null);

    const handleSelectedType = (item, index) => {
        setSelectedType(item);
        setIndexType(index);
    }


    useEffect(() => {
        inputTitleRef.current.value = reportInfo.title;
        inputDesRef.current.value = reportInfo.description;
        setIsEditing(reportInfo.status != 4)
        getIssueTypes();
    }, []);

    const handleSaveIssue = async (event) => {
        event.preventDefault();

        if (inputTitleRef.current && (inputTitleRef.current.value == "" || inputTitleRef.current.value == null)) {
            toast({
                type: "error",
                title: "ERROR",
                message: "Title is required",
                duration: 4000
            });

            inputTitleRef.current.focus();
            inputTitleRef.current.classList.toggle("irp__error");

            setTimeout(() => {
                inputTitleRef.current.classList.toggle("irp__error");
            }, 2000);
            return;
        }

        if (selectedType == null) {
            toast({
                type: "error",
                title: "ERROR",
                message: "Type is required",
                duration: 4000
            });
            return;
        }

        try {
            var formData = new FormData();
            formData.append("Type", selectedType.value);
            formData.append("Title", inputTitleRef.current.value);
            formData.append("Description", inputDesRef.current.value);

            const response = await appClient.put(`api/IssueReports/${reportInfo.issueId}`, formData);
            const dataRes = response.data;

            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Successfully",
                    message: "Update report successfully",
                    duration: 4000
                });

                handleClearInput();
                onReloadReport();
            }
        }
        catch (err) {
            console.log(err);
        }
    }


    return (
        <div className='fixed top-0 left-0 w-full h-full z-[1000] idr__wrapper flex justify-center items-center overflow-visible' onClick={(e) => onShow(false)}>
            <div className='w-[1000px] h-[300px] bg-white rounded-lg shadow-lg p-[20px] overflow-visible' onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center overflow-visible">
                    <div className="flex items-center flex-1 ">
                        <div className='arb__title--text'>Title</div>
                        <input
                            ref={inputTitleRef}
                            readOnly={!isEditing}
                            className={`arb__input`}
                        />
                    </div>
                    <div className="flex items-center flex-1 ml-[20px] overflow-visible">
                        <div className='arb__title--text'>Type</div>
                        <DropDownList
                            data={types}
                            defaultIndex={indexType}
                            className={`arb__input`}
                            readOnly={!isEditing}
                            onSelectedItem={handleSelectedType}
                        />
                    </div>
                </div>

                <div className='flex items-start mt-[20px]'>
                    <div className="arb__title--text">Description</div>
                    <textarea
                        rows={6}
                        readOnly={!isEditing}
                        name='Description'
                        ref={inputDesRef}
                        className={`arb__input resize-none`}
                    />
                </div>

                <div className='flex justify-end mt-[10px]'>
                    <button className='irp__btn-add !containerrounded-[15px] mr-[20px]' onClick={handleSaveIssue}>Save</button>
                    <button className='idr__btn-close' onClick={(e) => onShow(false)}>Close</button>
                </div>
            </div>
        </div>
    )

}

function IssueDetailResponse({ reportInfo, onShow, onReloadIssue }) {
    const [isShowDetail, setIsShowDetail] = useState(false);

    const handleShowDetailIssue = () => {
        setIsShowDetail(true);
    }

    return (
        <>
            <div className='fixed top-0 left-0 w-full h-full z-[1000] idr__wrapper flex justify-center items-center overflow-visible' onClick={(e) => onShow(false)}>
                <div className='w-[800px] h-[400px] flex flex-col bg-white rounded-lg shadow-lg p-[20px] overflow-visible' onClick={(e) => e.stopPropagation()}>
                    {reportInfo?.responses?.length == 0 &&
                        <div className='flex items-center justify-center flex-1 idr__title--no-res'>
                            Waiting for response this issue
                        </div>
                    }

                    {
                        <div className='flex-1'>
                            <div className='flex items-center justify-end'>
                                <div className='ir__des--text rounded-[15px]'>{reportInfo.description}</div>
                                <div className='ml-[10px]'>
                                    <img src={reportInfo?.image == null ? IMG_URL_BASE + "unknown_user.jpg" : APP_URL + reportInfo.image} className='w-[45px] h-[45px] object-cover rounded-[50%] border-[2px] border-[#000000]' />
                                </div>
                            </div>

                            {
                                reportInfo?.responses?.map((item, index) => {
                                    return (
                                        <div key={index} className='flex overflow-visible mt-[20px]'>
                                            <div className='w-[60px]'>
                                                {index == reportInfo.responses.length - 1 &&
                                                    <img src={item.image == null ? IMG_URL_BASE + "unknown_user.jpg" : APP_URL + item.image} className='w-[45px] h-[45px] object-cover rounded-[50%] border-[2px] border-[#000000]' />
                                                }
                                            </div>
                                            <div className='relative group overflow-visible'>
                                                <div className='idr__response-msg'>{item.message}</div>
                                                <div className='idr__response-time absolute top-[50%] translate-y-[-50%] right-[0%] translate-x-[100%] hidden group-hover:inline-block transition-all duration-700'>{item.createdAt}</div>
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>
                    }

                    <div className='flex justify-end'>
                        <button className='irp__btn-add !rounded-[15px] mr-[15px]' onClick={handleShowDetailIssue}>Edit Issue</button>
                        <button className='idr__btn-close' onClick={(e) => onShow(false)}>Close</button>
                    </div>
                </div>
            </div>

            {isShowDetail && <IssueDetailReport reportInfo={reportInfo} onShow={setIsShowDetail} onReloadIssue={onReloadIssue} />}
        </>
    )
}



export default IssueReportPage