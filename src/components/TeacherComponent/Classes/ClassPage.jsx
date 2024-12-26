import React from 'react'
import { Route, Routes } from 'react-router-dom'
import ClassListPage from './ClassListPage'
import ClassDetailPage from './ClassDetailPage'

function ClassPage() {
    return (
        <Routes>
            <Route path="/" element={<ClassListPage/>}/>
            <Route path="/:classId/detail/*" element={<ClassDetailPage/>}/>
        </Routes>
    )
}

export default ClassPage