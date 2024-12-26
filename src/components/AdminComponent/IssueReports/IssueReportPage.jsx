import React, { useEffect, useRef, useState } from 'react'
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE, APP_URL } from '~/GlobalConstant.js';
import "./IssueReportStyle.css"
import DropDownList from '../../CommonComponent/DropDownList';
import toast from '@/helper/Toast';

function IssueReportPage() {
    const [reports, setReports] = useState([]);
    const [sortConfig, setSortConfig] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [searchValue, setSearchValue] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const rowPerPage = 6;
    const indexLastItem = currentPage * rowPerPage;
    const indexFirstItem = indexLastItem - rowPerPage;
    const totalPage = Math.ceil(reports.length / rowPerPage);

    const getReports = async () => {
        try {
            const response = await appClient.get("api/IssueReports/admin");
            const dataRes = response.data;
            if (dataRes.success) {
                setReports(dataRes.message.map((item, index) => ({ ...item, index: index + 1 })));
            }
        }
        catch {

        }
    }

    useEffect(() => {
        getReports();
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

    const removeVietnameseAccents = (str) => {
        return str
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d")
            .replace(/Đ/g, "D");
    }

    const handleDeleteReport = (id) => {
        // let newClasses = classes.filter(c => c.classId != classId);
        // newClasses = newClasses.map((item, index) => ({ ...item, index: index + 1 }));
        // setClasses(newClasses);
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


    useEffect(() => {
        setSortedData(sortedDataFunc());
    }, [reports, sortConfig])

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
    }, [searchValue])

    return (
        <div className='w-full h-full px-[20px]'>
            <div className='flex justify-between items-center mt-[10px]'>
                <div className='cmp__title'>List of Reports</div>
                <div className="flex items-center">
                    <div className="flex items-center">
                        <div className='mpt__header-item--search-icon'>
                            <img src={IMG_URL_BASE + "search_icon.svg"} className='w-[30px] p-[6px]' />
                        </div>
                        <input placeholder='Search ...' className='mpt__header-item--search' value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                    </div>
                </div>
            </div>
            <div className='clb__wrapper'>
                <div className="clb__tbl__wrapper mt-[20px]">
                    <div className="mpt__header flex w-full">
                        <div className="mpt__header-item w-1/12" onClick={(event) => handleSort("index", event)}>No</div>
                        <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("userName", event)}>User Info</div>
                        <div className="mpt__header-item w-1/4" onClick={(event) => handleSort("title", event)}>Title</div>
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
                                    onReloadIssue={getReports} />
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
    const [isShowResponse, setIsShowResponse] = useState(false);
    const handleShowResponse = () => {
        setIsShowResponse(true);
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
                <div className="mpt__row-item w-1/4 !text-[12px] flex items-center">
                    <div>
                        <img src={reportInfo?.image == null ? IMG_URL_BASE + "unknown_user.jpg" : APP_URL + reportInfo.image} className='w-[45px] h-[45px] object-cover rounded-lg' />
                    </div>
                    <div className='flex flex-col justify-start'>
                        <div className='line-clamp-1 cabf__ti--text !text-[12px] !font-normal'>{reportInfo.userName}</div>
                        <div className='line-clamp-1 cabf__ti--text !text-[12px] !font-normal'>{reportInfo.email}</div>
                    </div>
                </div>
                <div className="mpt__row-item w-1/4 !text-[12px]">{reportInfo.title}</div>
                <div className="mpt__row-item w-1/12 !text-[12px]">{reportInfo.typeName}</div>
                <div className={`mpt__row-item w-1/12 !text-[12px] ${reportInfo.statusName.toLowerCase()}`}>{reportInfo.statusName}</div>
                <div className="mpt__row-item w-1/6 !text-[12px] ">{reportInfo.createdAt}</div>
                <div className="mpt__row-item w-1/12 flex justify-end" onClick={(e) => e.stopPropagation()}>
                    <button onClick={handleRemoveReport}>
                        <img src={IMG_URL_BASE + "close.svg"} className='w-[30px] p-[5px]' />
                    </button>
                </div>
            </div>

            {isShowResponse && <IssueResponse reportInfo={reportInfo} onReloadIssue={onReloadIssue} onShow={setIsShowResponse} />}
        </>

    )
}

function IssueResponse({ reportInfo, onReloadIssue, onShow }) {
    const [status, setStatus] = useState([]);
    const [selectedStatus, setSelectedStatus] = useState(null);
    const [indexStatus, setIndexStatus] = useState(0);

    const inputResponseRef = useRef();

    const getStatus = async () => {
        try {
            let response = await appClient.get("api/IssueReports/status");
            let dataRes = response.data;
            if (dataRes.success) {
                setStatus(dataRes.message);
                setSelectedStatus(dataRes.message.find(i => i.value == reportInfo.status));
                setIndexStatus(dataRes.message.findIndex(i => i.value == reportInfo.status));
            }
        }
        catch {

        }
    }

    const handleSelectedStatus = async (item, index) => {
        setSelectedStatus(item);
        setIndexStatus(index);


    }

    const handleSendResponse = async () => {
        try {
            if (inputResponseRef.current && (inputResponseRef.current.value == "" || inputResponseRef.current.value == null)) {
                toast({
                    type: "error",
                    title: "ERROR",
                    message: "Response message is required",
                    duration: 4000
                });

                inputResponseRef.current.focus();
                inputResponseRef.current.classList.toggle("irp__error");

                setTimeout(() => {
                    inputResponseRef.current.classList.toggle("irp__error");
                }, 2000);
                return;
            }

            try {
                const formData = new FormData();
                formData.append("IssueId", reportInfo.issueId);
                formData.append("Message", inputResponseRef.current.value);

                const response = await appClient.post("api/IssueReports/response", formData);
                const dataRes = response.data;
                if (dataRes.success) {
                    toast({
                        type: "success",
                        title: "Successfully",
                        message: "Send response successfully",
                        duration: 4000
                    });

                    inputResponseRef.current.value = "";
                    onReloadIssue();
                }
            }
            catch {

            }
        }
        catch {

        }
    }

    const handleRemoveResponse = async (item) => {
        try {
            var confirmAnswer = confirm("Do you want to delete this response?");
            if (!confirmAnswer) return;

            const response = await appClient.delete(`api/IssueReports/response/${item.issueResId}`);
            const dataRes = response.data;
            if (dataRes.success) {
                toast({
                    type: "success",
                    title: "Successfully",
                    message: "Delete response successfully",
                    duration: 4000
                });

                inputResponseRef.current.value = "";
                onReloadIssue();
            }
        }
        catch {

        }
    }
    useEffect(() => {
        getStatus();
    }, [])


    const handleUpdateStatus = async () => {
        if (selectedStatus != null && selectedStatus.value !== reportInfo.status) {
            try {
                const response = await appClient.patch(`api/IssueReports/${reportInfo.issueId}/status?status=${selectedStatus.value}`);
                const dataRes = response.data;
                if (dataRes.success) {
                    toast({
                        type: "success",
                        title: "Successfully",
                        message: "Change status successfully",
                        duration: 4000
                    });
                }

                onReloadIssue();
            }
            catch {

            }
        }
    }
    useEffect(() => {
        handleUpdateStatus();
    }, [selectedStatus])


    return (
        <div className='fixed top-0 left-0 w-full h-full z-[1000] idr__wrapper flex justify-center items-center overflow-visible' onClick={(e) => onShow(false)}>
            <div className='w-[800px] h-[400px] flex flex-col bg-white rounded-lg shadow-lg p-[20px] overflow-visible' onClick={(e) => e.stopPropagation()}>
                <div className='flex justify-between overflow-visible'>
                    <div className='ir__title--text'>{reportInfo.title}</div>

                    <div className='overflow-visible '>
                        <DropDownList
                            data={status}
                            defaultIndex={indexStatus}
                            onSelectedItem={handleSelectedStatus}
                            className={"w-[150px] border border-[#cccccc]"}
                        />
                    </div>

                </div>
                <div className='flex flex-col mt-[20px] flex-1'>
                    <div className='flex items-start'>
                        <div className='mr-[10px]'>
                            <img src={reportInfo?.image == null ? IMG_URL_BASE + "unknown_user.jpg" : APP_URL + reportInfo.image} className='w-[45px] h-[45px] object-cover rounded-[50%] border-[2px] border-[#000000]' />
                        </div>
                        <div className='ir__des--text rounded-[15px]'>{reportInfo.description}</div>
                    </div>

                    {
                        reportInfo.responses.map((item, index) => {
                            return (
                                <div key={index} className='flex justify-end items-center mt-[10px] group'>
                                    <button onClick={(e) => { handleRemoveResponse(item) }} className='mr-[10px] hover:bg-gray-200 transition-all duration-500 rounded-lg hidden group-hover:inline-block'>
                                        <img src={IMG_URL_BASE + "trash_icon.svg"} className='w-[30px] p-[6px]' />
                                    </button>
                                    <div className='ir__des--text rounded-[15px] text-right'>{item.message}</div>
                                </div>
                            )
                        })
                    }
                </div>



                <div className='ml-[55px] flex'>
                    <input className='border ir__input-res' ref={inputResponseRef} placeholder='Enter response message...' />
                    <button className='ir__btn-func' onClick={handleSendResponse}>Send</button>
                    <button className='ir__btn-close'>Close</button>
                </div>
            </div>
        </div>
    )
}

export default IssueReportPage