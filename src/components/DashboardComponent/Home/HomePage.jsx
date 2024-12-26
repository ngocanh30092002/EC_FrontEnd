import React from 'react';
import CalendarEvent from './CalendarEvent';
import "./HomeStyle.css";
import RecommendCourses from './RecommendCourses';
import SliderAdsPage from './SliderAdsPage';

function HomePage() {
  

    return (
        <div className="grid grid-cols-12 gap-[15px] mx-[20px]">
            <div className="col-span-12 lg:col-span-8 grid grid-cols-12 gap-[15px] min-h-[535px]">
                <SliderAdsPage />
            </div>
            <div className="col-span-12 lg:col-span-4">
                <CalendarEvent />
            </div>

            <div className='col-span-12'>
                <RecommendCourses />
            </div>
        </div>
    )
}


function HomeInfoItem({ number, title, imgUrl, bgColor }) {
    return (
        <div className='home-info__item'>
            <div className='flex items-center pb-[15px]'>
                <div className={`hi__item-img ${bgColor ?? ""}`}>
                    <img src={imgUrl} alt='' className='w-[30px] h-[30px] md:w-[22px] md:h-[22px]' />
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