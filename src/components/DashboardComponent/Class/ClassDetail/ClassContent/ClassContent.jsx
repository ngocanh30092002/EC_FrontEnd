import React, { useState } from 'react'
import ClassContentHeader from './ClassContentHeader'
import { useLocation } from 'react-router-dom';
import SchedulePage from './SchedulePage';
import HomeworkPage from './HomeworkPage';
import ClassMaterialPage from './ClassMaterialPage';

function ClassContent({ enrollId }) {
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const [pageNum, setPageNum] = useState(() => {
        const page = params.get("page");
        return page ? parseInt(page) : 0;
    })

    const handleSetPage = (value) => {
        setPageNum(value);
        params.set("page", value);
        const newUrl = `${window.location.pathname}?${params.toString()}`;
        window.history.pushState(history.state, "", newUrl); 
    }

    return (
        <div className='flex-1 bg-white flex flex-col'>
            <ClassContentHeader pageNum={pageNum} onChangePage={handleSetPage} />
            <div className='flex-1'>
                {pageNum == 0 && <SchedulePage enrollId={enrollId} />}
                {pageNum == 1 && <HomeworkPage enrollId={enrollId} />}
                {pageNum == 2 && <ClassMaterialPage enrollId={enrollId} />}
            </div>
        </div>
    )
}

export default ClassContent