import React, { Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import LoaderPage from '../../../LoaderComponent/LoaderPage';

const LazyLoading = (importFunc, delay = 200) => {
    return React.lazy(async () => {
        await new Promise(resolve => setTimeout(resolve, delay));
        return importFunc();
    });
};

const ToeicAddQuestion = LazyLoading(() => import('./ToeicAddQuestion'));
const QuestionToeicListBoard = LazyLoading(() => import('./QuestionToeicListBoard'));

function QuestionToeicPage({isTeacher = false}) {
    return (
        <Suspense fallback={<LoaderPage />}>
            <Routes>
                <Route path='/' element={<QuestionToeicListBoard isTeacher={isTeacher} />} />
                <Route path='/:toeicId/add-ques' element={<ToeicAddQuestion />} />
            </Routes>
        </Suspense>
    )
}



export default QuestionToeicPage