import { Route, Routes } from 'react-router-dom';
import CourseDetailPage from './CourseDetail/CourseDetailPage';
import CourseMainPage from './CourseMain/CourseMainPage';
import CourseRegisterPage from './CourseRegister/CourseRegisterPage';


function CoursesPage() {
    return (
        <div>
            <Routes>
                <Route path ="register/*" element = {<CourseRegisterPage/>}/>
                <Route path = "detail/*" element = {<CourseDetailPage/>}/>
                <Route path = "/" element = {<CourseMainPage/>}/>
            </Routes>
        </div>
    )
}

export default CoursesPage