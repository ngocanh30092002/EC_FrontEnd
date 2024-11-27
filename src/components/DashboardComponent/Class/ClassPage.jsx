import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import LoaderPage from '../../LoaderComponent/LoaderPage';

const LazyLoading = (importFunc, delay = 750) => {
    return React.lazy(async () => {
        await new Promise(resolve => setTimeout(resolve, delay));
        return importFunc();
    });
};

const ClassMainPage = LazyLoading(() => import('./ClassMainPage'));
const ClassDetailPage = LazyLoading(() => import('./ClassDetail/ClassDetailPage'));


function ClassPage() {
    return (
        <Suspense fallback={<LoaderPage />}>
            <Routes>
                <Route path='/' element={<ClassMainPage />} />
                <Route path='/:classId' element={<ClassDetailPage />} />
            </Routes>
        </Suspense>
    )
}

export default ClassPage