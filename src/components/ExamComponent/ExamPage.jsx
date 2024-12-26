import React, { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import LoaderPage from '../LoaderComponent/LoaderPage';
import "../AssignmentComponent/InProcess/InProcessStyle.css";
import "../AssignmentComponent/Overview/OverviewStyle.css";
import "./ExamStyle.css"
import MenuContextPage from '../MenuContextComponent/MenuContextPage';

const LazyLoading = (importFunc, delay = 1000) => {
    return React.lazy(async () => {
        await new Promise(resolve => setTimeout(resolve, delay));
        return importFunc();
    });
};

const StatusPage = LazyLoading(() => import('../StatusComponent/StatusPage'));
const InprocessPage = LazyLoading(() => import('./Inprocess/InprocessPage'));
const OverViewPage = LazyLoading(() => import('./OverView/OverViewPage'));
const PreparePage = LazyLoading(() => import('./Prepare/PreparePage'));
const PrepareHwPage = LazyLoading(() => import('./Prepare/PrepareHwPage'));
const PrepareRoadMapPage = LazyLoading(() => import('./Prepare/PrepareRoadMapPage'));

function ExamPage() {
    return (
        <>
            <Suspense fallback={<LoaderPage />}>
                <Routes>
                    <Route path="/overview" element={<OverViewPage />} />
                    <Route path="/in-process" element={<InprocessPage />} />
                    <Route path="/" element={<PreparePage />} />
                    <Route path="/prepare-homework" element={<PrepareHwPage />} />
                    <Route path="/prepare-road-map" element={<PrepareRoadMapPage />} />
                    <Route path='/*' element={<StatusPage status={404} />} />
                </Routes>
            </Suspense>

            <MenuContextPage/>
        </>
    )
}

export default ExamPage