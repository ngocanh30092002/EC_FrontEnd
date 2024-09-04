import './RecommendStyle.css';

function RecommendCourses() {
    return (
        <div className="recommend-courses__wrapper">
            <div className="rc__header flex justify-between items-center mb-[10px]">
                <div className='rc__header-text'>Recommend for you</div>

                <button className='rc__header-button'>See All</button>
            </div>
            <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-[15px]'>
               <CourseItem/>
               <CourseItem/>
               <CourseItem/>
            </div>
        </div>
    );
}

function CourseItem(){
    return (
        <div className='rc__item-wrapper'>
            <div className='rc__item-img'>
                <img src='src/assets/imgs/user_image.jpg' alt='image-course' />
            </div>

            <div className='rc__item-body'>
                <span className='rc__item--title'>Design Workshop Facilitation</span>
                <span className='rc__item--des line-clamp-2'>Master your skills in design facilitaion and learn how to promote collaboration and find some think like thattttttttttttt</span>
            </div>

            <div className='rc__item-extra flex items-center justify-between relative z-[-1]'>
                <div className='flex items-center '>
                    <div className='rc__extra-sub-item'>
                        <i className="fa-regular fa-hourglass-half text-orange-500"></i>
                        <span className='rc__extra--des'>Begin</span>
                    </div>
                    <div className='rc__extra-sub-item ml-[20px]'>
                        <i className="fa-regular fa-hourglass-half text-orange-500"></i>
                        <span className='rc__extra--des'>6 houres</span>
                    </div>
                </div>

                <div className='rc__extra-sub-item'>
                    <i className="fa-regular fa-hourglass-half text-orange-500"></i>
                    <span className='rc__extra--des'>30/30</span>
                </div>

            </div>
        </div>
    )
}

export default RecommendCourses;