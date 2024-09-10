import { useState } from "react"
import "./ContinueLearningStyle.css"

function ContinueLearning(){
    return (
        <div className='home-info__courses p-[15px]'>
            <div className="hi__course-header flex justify-between items-center">
                <div className="hi__course-header--title text-[17px]">
                    Continue Learning
                </div>
                <div className='flex'>
                    <div className='hidden md:flex relative mr-[10px] '>
                        <input className='hi__course-header--search md:w-[260px] lg:w-[300px]' type='text' placeholder='Search for courses...'/>
                        <img src='/src/assets/imgs/light-color-search.svg' className='hi__course-header-icon'/>
                    </div>

                    <button className='hi__course-header--btn'>
                        See All
                    </button>
                </div>
            </div>

            <div className="hi__course-body">
                <table className='hi__course-table'>
                    <thead className='ct_header'>
                        <tr className='ct_row header'>
                            <th className='w-1/2 md:w-5/12 lg:w-1/3'>Course Name</th>
                            <th className='w-1/2 md:w-4/12 lg:w-1/3'>Progress</th>
                            <th className='hidden md:block md:w-3/12 lg:w-1/3'>Status</th>
                        </tr>
                    </thead>

                    <tbody className={`h-[268px] mt-[10px]`}>
                        <LearningItem/>
                        <LearningItem/>
                        <LearningItem/>
                        <LearningItem/>
                    </tbody>
                </table>
            </div>
        </div>
    )
}

function LearningItem({progress = 20}){
    return (
        <tr className="cursor-pointer">
            <td className="w-1/2 md:w-5/12 lg:w-1/3 h-[70px]"><LearningInfo  name="Design Accessibility" subName="Advanced" time="4 hours" imgUrl ="/src/assets/imgs/user_image.jpg"/></td>
            <td className="w-1/2 md:w-4/12 lg:w-1/3 h-[70px]">
                <div className='li__study-wrapper flex items-center overflow-hidden'>
                    <div className='li__study-bar'>
                        <div className='li__study-bar-current' style={{width: progress + "%"}}/>
                    </div>

                    <div className='li__study-bar-text'>
                        {progress}%
                    </div>
                </div>
            </td>
            <td className="hidden md:block md:w-3/12 lg:w-1/3 h-[70px]">
                <LearningStatus statusCode={1}/>
            </td>
        </tr>
    )
}

function LearningInfo(props){
    return (
        <div className='li__info-wrapper'>
            <div className='li__info-img'>
                <img src={props.imgUrl}/>
            </div>

            <div className='li__info-body'>
                <div className="li__info-name line-clamp-1">
                    {props.name}
                </div>

                <div className="li__info-sub ">
                    <div className='li__info-sub--name '>
                        {props.subName}
                    </div>
                    <div className='li__info-sub--time '>
                        {props.time}
                    </div>
                </div>
            </div>
        </div>
    )
}
function LearningStatus({statusCode}){
    const listStatus = [
        {
            status: 0,
            name: "In Process",
            icon: <i className="fa-regular fa-hourglass-half text-orange-500"></i>,
        },
        {
            status: 1,
            name: "Completed",
            icon: <i className="fa-solid fa-check text-green-500"></i>,
        }
    ]

    const currentStatus = listStatus.find(i => i.status === statusCode);

    return (
        <div className='li__status-wrapper flex justify-between items-center'>
            <div className='hidden md:flex items-center li_status-body '>
                <div className='li__status-icon'>
                    {currentStatus.icon}
                </div>

                <span className='li__status-text'>{currentStatus.name}</span>
            </div>

            <div className='li__status-next-icon md:hidden lg:block'>
                <i className="fa-solid fa-chevron-right"></i>
            </div>
        </div>
    )
}

export default ContinueLearning;