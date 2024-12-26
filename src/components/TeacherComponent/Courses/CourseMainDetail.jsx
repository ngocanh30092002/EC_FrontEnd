import React, { Suspense, useEffect, useState } from 'react'
import { Route, Routes, useLocation, useNavigate, useParams } from 'react-router-dom'
import LoaderPage from '../../LoaderComponent/LoaderPage';
import CourseContentPage from './CourseContentPage';
import RoadMapPage from './RoadMapPage';

function CourseMainDetail() {
    const { courseId } = useParams();    
    const location = useLocation();
    
    const navigate = useNavigate();

    const [pageNum, setPageNum] = useState(0)

    const handleSetPage = (value) => {
        setPageNum(value);

        if (value == 1) {
            navigate("roadmaps")
        }
        else {
            navigate("");
        }
    }


    useEffect(() => {
        if (courseId == null) {
            navigate(-1);
            return;
        }
    }, [])

    useEffect(() => {
        if (location.pathname.includes("/roadmaps")) {
            setPageNum(1);
        } else {
            setPageNum(0);
        }
    }, [location.pathname]);

    return (
        <div className='overflow-visible h-full'>
            <CourseNavigation pageNum={pageNum} onChangePage={handleSetPage} />

            <div className='flex-1 overflow-visible'>
                <Suspense fallback={<LoaderPage />}>
                    <Routes>
                        <Route path='/*' element={<CourseContentPage />} />
                        <Route path='roadmaps/*' element={<RoadMapPage />} />
                    </Routes>
                </Suspense>
            </div>
        </div>
    )
}

function CourseNavigation({ pageNum, onChangePage }) {
    return (
        <div className='flex items-center justify-center'>
            <button className={`qpa__nav ${pageNum == 0 && "active"}`} onClick={(e) => onChangePage(0)}>Contents</button>
            <button className={`qpa__nav ${pageNum == 1 && "active"}`} onClick={(e) => onChangePage(1)}>RoadMaps</button>
        </div>
    )
}

export default CourseMainDetail