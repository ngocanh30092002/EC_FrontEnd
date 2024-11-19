import toast from '@/helper/Toast';
import { CreateRandom } from "@/helper/RandomHelper"
import React, { useContext, useEffect, useState } from 'react';
import { appClient } from '~/AppConfigs';
import { IMG_URL_BASE } from '~/GlobalConstant.js';
import { CourseDetailItemContext } from './CourseDetailItem';
import { useNavigate } from 'react-router-dom';
import HistoryProcesses from './HistoryProcesses';


function CourseLectureList({ contents }) {
    var count = 1;
    var newContents = contents.map((item) => {
        return {
            ...item,
            assignments: item.assignments.map((assign) => {
                return {
                    ...assign,
                    noNumRender: count++
                };
            }),
            examination: item.assignments.length === 0 ?
                {
                    ...item.examination,
                    noNumRender: count++
                }
                : item.examination
        };
    })

    return (
        <div className='cli__wrapper mt-[20px]'>
            {newContents.map((item, index) =>
                <CourseLectureItem
                    content={item}
                    index={index}
                    key={index}
                />
            )}
        </div>
    )
}

function CourseLectureItem({ content, index }) {
    const [selectedItem, setSelectedItem] = useState({});
    const [isOpen, setOpen] = useState(false);
    const [isShowHis, setIsShowHis] = useState(false);
    const { dataContext } = useContext(CourseDetailItemContext);
    const enroll = dataContext.enroll;
    const assignments = content.assignments;
    const examination = content.examination;
    const navigate = useNavigate();

    const renderImageElement = (status) => {
        if (status === "Locked") {
            return <img src={IMG_URL_BASE + "clocked.svg"} className='w-[25px]' />
        }
        if (status === "Passed") {
            return <img src={IMG_URL_BASE + "check_thin_icon.svg"} className='w-[25px]' />
        }

        return null;
    }

    const handleOpenSubContent = () => {
        setOpen(!isOpen);
    }

    const handleRedirectHref = (e, item) => {
        e.preventDefault();
        if (item.status === "Locked") {
            toast({
                type: "warning",
                title: "Warning",
                message: "You need to complete previous lesson",
                duration: 4000
            })

            return;
        }

        if (item.status === "Open") {
            let id = content.type === 1 ? item.assignmentId : item.examId;

            const sessionId = CreateRandom();
            const sessionExamId = CreateRandom();
            sessionStorage.setItem(sessionExamId, btoa(id));
            sessionStorage.setItem(sessionId, enroll.enrollId);

            if (content.type === 1) {
                navigate(`/assignment?id=${sessionId}&assignmentId=${id}`)
            }
            else {
                navigate(`/examination?examId=${sessionExamId}&id=${sessionId}&type=1`)
            }

            return;
        }

        setSelectedItem(item);
        setIsShowHis(true);
    }

    return (
        <div className='cli__course--content'>
            <div>
                <div className="cli__title--wrapper" onClick={handleOpenSubContent}>
                    <div className='flex items-center'>
                        {isOpen ?
                            <img className='w-[18px]' src={IMG_URL_BASE + "minus-icon.svg"} />
                            :
                            <img className='w-[18px]' src={IMG_URL_BASE + "plus-icon.svg"} />
                        }
                        <span className='ml-[10px] cli__title'>{index + 1}. {content.title}</span>
                    </div>

                    <div className='cli__title--total'>{assignments.length > 0 ? assignments.length : examination == null ? 0 : 1} Lessons</div>
                </div>
                {
                    isOpen
                    &&
                    <ul className='cli__list'>
                        {content.type === 1 ?
                            assignments.map((item, index) =>
                                <li className='cli__item' key={index}>
                                    <a className='w-full flex items-center' onClick={(e) => handleRedirectHref(e, item)} href='/assginment'>
                                        <div className='flex-1'>
                                            <img className='cli__item--img' />
                                            <div className='cli__item--title'>
                                                <div className='min-w-[20px] text-left'>{item.noNumRender}.</div>
                                                <div className='ml-[10px]'>{item.title}</div>
                                            </div>
                                        </div>
                                        <div className='flex items-center min-w-[85px] justify-between'>
                                            {renderImageElement(item.status)}
                                            <span className='cli__item--time ml-auto'>{item.time}</span>
                                        </div>
                                    </a>
                                </li>
                            )
                            :
                            <li className='cli__item'>
                                <a className='w-full flex items-center' onClick={(e) => handleRedirectHref(e, examination)} href='/examination'>
                                    <div className='flex-1'>
                                        <img className='cli__item--img' />
                                        <div className='cli__item--title'>
                                            <div className='min-w-[20px] text-left'>{examination.noNumRender}.</div>
                                            <div className='ml-[10px]'>{examination.title}</div>
                                        </div>
                                    </div>
                                    <div className='flex items-center min-w-[85px] justify-between'>
                                        {renderImageElement(examination.status)}
                                        <span className='cli__item--time ml-auto'>{examination.time}</span>
                                    </div>
                                </a>
                            </li>
                        }
                    </ul>
                }
            </div>

            {isShowHis
                &&
                <HistoryProcesses
                    onSetShow={setIsShowHis}
                    assignmentId = {selectedItem.assignmentId}
                    examId = {selectedItem.examId}
                    type={content.type}
                    enrollId={enroll.enrollId}
                />
            }
        </div >
    )
}

export default CourseLectureList