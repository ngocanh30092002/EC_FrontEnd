import { Route, Routes } from 'react-router-dom'
import './App.css'
import { StoreProvider } from "./store"
import React,{ Suspense, useEffect } from 'react'
import LoaderPage from './components/LoaderComponent/LoaderPage';

const LazyLoading = (importFunc, delay = 750) => {
    return React.lazy(async () => {
        await new Promise(resolve => setTimeout(resolve, delay));
        return importFunc();
    });
};


const AccountPage = LazyLoading(() => import('./components/AccountComponent/AccountPage'));
const AdminPage = LazyLoading(() => import('./components/AdminComponent/AdminPage'));
const TeacherPage = LazyLoading(() => import('./components/TeacherComponent/TeacherPage'));
const AssignmentPage = LazyLoading(() => import('./components/AssignmentComponent/AssignmentPage'));
const StatusPage = LazyLoading(() => import('./components/StatusComponent/StatusPage'));
const ExamPage = LazyLoading(() => import('./components/ExamComponent/ExamPage'));
const DashboardPage = LazyLoading(() => import('./components/DashboardComponent/DashboardPage'));

function App() {
    return (
        <StoreProvider>
            <Suspense fallback={<LoaderPage/>}>
                <Routes>
                    <Route path='account/*' element={<AccountPage />} />
                    <Route path='admin/*' element={<AdminPage />} />
                    <Route path='teacher/*' element={<TeacherPage />} />
                    <Route path='assignment/*' element={<AssignmentPage />} />
                    <Route path='examination/*' element={<ExamPage />} />
                    <Route path='not-found' element={<StatusPage status={404} />} />
                    <Route path='access-denied' element={<StatusPage status={403} />} />
                    <Route path='/*' element={<DashboardPage />} />
                    <Route path='*' element={<StatusPage status={404} />} />
                </Routes>
            </Suspense>

            <div id='toast' />
        </StoreProvider>
    )
}

export default App
