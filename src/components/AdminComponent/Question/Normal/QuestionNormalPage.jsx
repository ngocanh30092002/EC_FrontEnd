import React from 'react'
import { Route, Routes } from 'react-router-dom'
import QuestionNormalMain from './QuestionNormalMain'

function QuestionNormalPage() {
    return (
        <Routes>
            <Route path="/*" element={<QuestionNormalMain/>}/>
        </Routes>
    )
}

export default QuestionNormalPage