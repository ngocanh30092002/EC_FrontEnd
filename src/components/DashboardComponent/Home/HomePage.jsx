import React from 'react'
import "./HomeStyle.css"
import ContinueLearning from './ContinueLearning';
import RecommendCourses from './RecommendCourses';
import { appClient } from '~/AppConfigs';

function HomePage() {
    const imgUrlBase = '/src/assets/imgs/';
    const infoItems = [
        {
            number: 24,
            title: 'Enrolled Courses',
            imgUrl: imgUrlBase + "enrolled_icon.svg",
            bgColor: "bg-green-400"
        }
        ,{
            number: 24,
            title: 'Completed Homework',
            imgUrl: imgUrlBase + "hw_icon.svg",
            bgColor: "bg-violet-400"
        },
        {
            number: 24,
            title: 'Toeics Completed',
            imgUrl: imgUrlBase + "test_icon.svg",
            bgColor: "bg-rose-400"
        }
    ]

    const handleSendNoti = () => {
        const sendNoti = async () => {
            const notification = {
                Title: "New Notification",
                Description: "This is a test notification.",
                Image: "/notifications/images/user_image.jpg",
            };
           var response = await appClient.post("api/Notification/send-noti?groupName=123", notification)
        }

        sendNoti();
    }

    return (
        <div className="grid grid-cols-12 gap-[15px] mx-[20px]">
            <div className="col-span-12 lg:col-span-9 grid grid-cols-12 gap-[15px]">
                {infoItems.map((item,index) =>{
                    return (
                    <div className="col-span-12 md:col-span-4" key={index}>
                        <HomeInfoItem 
                            number={item.number} 
                            title={item.title} 
                            imgUrl={item.imgUrl} 
                            bgColor={item.bgColor}/>
                    </div>
                    )
                })}
                <div className="col-span-12">
                    <ContinueLearning/>
                </div>
            </div>
            <div className="col-span-12 lg:col-span-3 bg-slate-400">
                <button onClick={handleSendNoti}>Send Notification</button>
            </div>

            <div className='col-span-12'>
                <RecommendCourses/>
            </div>
        </div>
    )
}


function HomeInfoItem({number, title, imgUrl, bgColor}){
    return (
        <div className='home-info__item'>
            <div className='flex items-center pb-[15px]'>
                <div className={`hi__item-img ${bgColor ?? ""}`}>
                    <img src={imgUrl} alt='' className='w-[30px] h-[30px] md:w-[22px] md:h-[22px]'/>
                </div>
                <div className='hi__item-body flex-1'>
                    <span className='hi__item-number'>{number}</span>
                    <span className='hi__item-title line-clamp-1' title={title}>{title}</span>
                </div>
            </div>

            <div className='hi__item-sub flex justify-between items-center'>
                <div className="hi__sub-des">View details</div>
                <div className='hi__sub-img'>
                    <i className="fa-solid fa-arrow-right-long"></i>
                </div> 
            </div>
        </div>
    )
}
export default HomePage