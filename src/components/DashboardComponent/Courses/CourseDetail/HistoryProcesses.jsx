import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { IMG_URL_BASE } from '~/GlobalConstant.js';
import { appClient } from '~/AppConfigs';
import { CreateRandom } from '@/helper/RandomHelper';

function HistoryProcesses({ onSetShow, type, assignmentId, examId, enrollId }) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [hisProcesses, setHisProcesses] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const totalPage = Math.ceil(hisProcesses.length / itemsPerPage)
    const currentHisProcesses = hisProcesses.slice(indexOfFirstItem, indexOfLastItem);

    useEffect(() => {
        const hisProcessesPromise = async () => {
            try {
                let queryParam = type === 1 ? `assignmentId=${assignmentId}` : `examId=${examId}`;
                const response = await appClient.get(`api/learningprocesses/his/enrollments/${enrollId}?${queryParam}`)
                const data = response.data;
                if (data.success) {
                    return data.message;
                }
                return null;
            }
            catch {
                return null;
            }
        };

        hisProcessesPromise()
            .then((data) => {
                setHisProcesses([...data]);
                setIsLoading(false);
            });

    }, [])

    const handleCloseHistory = (e) => {
        onSetShow(false);
    }

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleNextPage = () => {
        if (currentPage < totalPage) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handleRedirectHref = (e, item) => {
        e.preventDefault();
        const sessionId = CreateRandom();
        sessionStorage.setItem(sessionId, item.processId);

        if (type === 1) {
            navigate(`/assignment/prepare?id=${sessionId}`)
        }
        else {
            navigate(`/exam?mode=view-result&id=${sessionId}`)
        }
    }

    const handleReAttempt = (e) => {
        if (type === 1) {
            const sessionId = CreateRandom();
            sessionStorage.setItem(sessionId, enrollId)
            navigate(`/assignment?&id=${sessionId}&assignmentId=${assignmentId}`);
        }
        else {
            navigate(`/exam?mode=view-result&id=${sessionId}`)
        }
    }

    return (
        <>
            {!isLoading && (
                <div className='fixed w-full h-full z-[1000] top-0 left-0 his-process__wrapper' onClick={handleCloseHistory}>
                    <div className='his-process__content p-[20px] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white w-[70%] rounded-[8px]' onClick={(e) => e.stopPropagation()}>
                        <div className='his-process__title'>
                            Assginment History
                        </div>

                        <div className='his-process__table mt-[30px]'>
                            <div className='his-process__header flex w-full'>
                                <div className='w-1/12'>No</div>
                                <div className='w-1/4'>Start Time</div>
                                <div className='w-1/4'>End Time</div>
                                <div className='w-1/4'>Status</div>
                                <div className='w-1/6'>Result</div>
                            </div>

                            <div className='his-process__rows min-h-[210px]'>
                                {currentHisProcesses.map((item, index) =>
                                    <a className='his-process__row flex w-full items-center' key={index} onClick={(e) => handleRedirectHref(e, item)}>
                                        <div className='w-1/12'>#{indexOfFirstItem + index + 1}</div>
                                        <div className='w-1/4'>{item.startTime}</div>
                                        <div className='w-1/4'>{item.endTime}</div>
                                        {
                                            item.status === "Completed" || item.status === "Achieved" ?
                                            <div className='w-1/4 his-process__item-passed'><span>Passed</span></div> :
                                            <div className='w-1/4 his-process__item-failed'><span>Failed</span></div>
                                        }

                                        <div className='w-1/6'>{item.result}</div>
                                    </a>
                                )}
                            </div>

                            <div className="flex justify-between items-center">
                                <div>
                                    <button
                                        className='p-[10px] hover:bg-gray-300 rounded-[8px]'
                                        onClick={handlePreviousPage}
                                    >
                                        <img src={IMG_URL_BASE + "pre_page_icon.svg"} className='w-[20px]' />
                                    </button>
                                    <button
                                        className='p-[10px] hover:bg-gray-300 rounded-[8px] '
                                        onClick={handleNextPage}
                                    >
                                        <img src={IMG_URL_BASE + "next_page_icon.svg"} className='w-[20px]' />
                                    </button>
                                </div>

                                <div>
                                    <button className='his-process__btn mr-2 px-[20px] py-[9.5px]' onClick={handleReAttempt}>Re-Attempt</button>
                                    <button className='his-process__btn py-[9.5px] px-[15px] close' onClick={handleCloseHistory}>Close</button>
                                </div>
                            </div>
                        </div>

                        <div>

                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default HistoryProcesses