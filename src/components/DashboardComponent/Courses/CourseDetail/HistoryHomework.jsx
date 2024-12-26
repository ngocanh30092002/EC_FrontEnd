import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE } from '~/GlobalConstant.js';
import "./CourseDetailStyle.css"
import { CreateRandom } from '@/helper/RandomHelper';

function HistoryHomework({ onSetShow, enrollId, homeworkId }) {
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
        const historyHomeworksPromise = async () => {
            try {
                const response = await appClient.get(`api/HwSubmission/enrolls/${enrollId}?homeworkId=${homeworkId}`)
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

        historyHomeworksPromise()
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
        const sessionId = CreateRandom();
        sessionStorage.setItem(sessionId, item.submissionId);
        
        navigate(`/assignment/prepare-homework?id=${sessionId}`)
    }

    return (
        <>
            {!isLoading && (
                <div className='fixed w-full h-full z-[1000] top-0 left-0 his-process__wrapper' onClick={handleCloseHistory}>
                    <div className='his-process__content p-[20px] absolute top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] bg-white w-[70%] rounded-[8px]' onClick={(e) => e.stopPropagation()}>
                        <div className='his-process__title'>
                            Homeworks History
                        </div>

                        <div className='his-process__table mt-[30px]'>
                            <div className='his-process__header flex w-full'>
                                <div className='w-1/12'>No</div>
                                <div className='w-1/4'>Start Time</div>
                                <div className='w-1/4'>End Time</div>
                                <div className='w-1/6'>Result</div>
                                <div className='w-1/6'>Status</div>
                                <div className='w-1/12'>Correct</div>
                            </div>

                            <div className='his-process__rows min-h-[280px]'>
                                {currentHisProcesses.map((item, index) =>
                                    <a className='his-process__row flex w-full items-center' key={index} onClick={(e) => handleRedirectHref(e, item)}>
                                        <div className='w-1/12'>#{indexOfFirstItem + index + 1}</div>
                                        <div className='w-1/4'>{item.homework.startTime}</div>
                                        <div className='w-1/4'>{item.homework.endTime}</div>
                                        {
                                            item.isPass == true ?
                                                <div className='w-1/6 his-process__item-passed'><span>Passed</span></div>
                                                :
                                                <div className='w-1/6 his-process__item-failed'><span>Failed</span></div>
                                        }

                                        <div className={`w-1/6 his-process__item--hw ${item.status == "Late" && "late"} ${item.status == "Overdue" && "over-due"}`}><span>{item.status}</span></div>

                                        <div className='w-1/12'>{item.score.correct}/{item.score.total}</div>
                                    </a>
                                )}
                            </div>

                            <div className="flex justify-between items-center mt-[10px]">
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

export default HistoryHomework