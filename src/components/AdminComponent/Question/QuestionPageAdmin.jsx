import React, { Suspense, useEffect, useState } from 'react'
import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import "./QuestionStyle.css"
import LoaderPage from '../../LoaderComponent/LoaderPage';

const LazyLoading = (importFunc, delay = 1000) => {
    return React.lazy(async () => {
        await new Promise(resolve => setTimeout(resolve, delay));
        return importFunc();
    });
};

const QuestionToeicPage = LazyLoading(() => import('./Toeic/QuestionToeicPage'));
const QuestionNormalPage = LazyLoading(() => import('./Normal/QuestionNormalPage'));


function QuestionPageAdmin() {
    const location = useLocation();
    const navigate = useNavigate();
    const [pageNum, setPageNum] = useState(0)

    const handleSetPage = (value) => {
        setPageNum(value);

        if (value == 1) {
            navigate("toeic")
        }
        else {
            navigate("");
        }
    }

    useEffect(() => {
        if (location.pathname.includes("/toeic")) {
            setPageNum(1);
        } else {
            setPageNum(0);
        }
    }, [location.pathname]);

    return (
        <div className='overflow-visible h-full'>
            <QuestionNavigate pageNum={pageNum} onChangePage={handleSetPage} />

            <div className='flex-1 overflow-visible'>
                <Suspense fallback={<LoaderPage />}>
                    <Routes>
                        <Route path='/*' element={<QuestionNormalPage />} />
                        <Route path='toeic/*' element={<QuestionToeicPage />} />
                    </Routes>
                </Suspense>
            </div>
        </div>
    )
}


function QuestionNavigate({ pageNum, onChangePage }) {
    return (
        <div className='flex items-center justify-center'>
            <button className={`qpa__nav ${pageNum == 0 && "active"}`} onClick={(e) => onChangePage(0)}>Normal</button>
            <button className={`qpa__nav ${pageNum == 1 && "active"}`} onClick={(e) => onChangePage(1)}>Toeic</button>
        </div>
    )
}
export default QuestionPageAdmin