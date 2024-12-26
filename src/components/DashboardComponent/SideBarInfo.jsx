import MemberPage from '../AdminComponent/Member/MemberPage';
import RolePage from '../AdminComponent/Role/RolePage';
import ClassPage from './Class/ClassPage';
import CoursesPage from './Courses/CoursesPage';
import DictionaryPage from './Dictionary/DictionaryPage';
import HomePage from './Home/HomePage';
import LogoutPage from './Logout/LogoutPage';
import ProfilePage from './Profile/ProfilePage';
import RoadMapPage from './Toeics/RoadMapPage';
import { CLIENT_URL } from '~/GlobalConstant.js';
import ClassPageAdmin from './../AdminComponent/Class/ClassPage';
import CoursePageAdmin from '../AdminComponent/Course/CoursePageAdmin';
import QuestionPageAdmin from '../AdminComponent/Question/QuestionPageAdmin';
import ClassPageTeacher from"./../TeacherComponent/Classes/ClassPage";
import QuestionPageTeacher from '../TeacherComponent/Question/QuestionPageTeacher';
import IssueReportPage from './IssueReport/IssueReportPage';
import IssueReportPageAdmin from './../AdminComponent/IssueReports/IssueReportPage';
import CoursePageTeacher from '../TeacherComponent/Courses/CoursePageTeacher';

export const shorcutToAdminComponent =
{
    id: 30,
    name: "Admin",
    img: 'sync-icon.svg',
    link: "/admin",
    linkToRedirect: "/admin",
} 


export const homeComponents = [
    {
        id: 0,
        name: "Home",
        component: <HomePage />,
        img: 'home_icon.svg',
        link: "/",
        linkToRedirect: "/",
    },
    {
        id: 1,
        name: "Profile",
        component: <ProfilePage />,
        img: "user-profile.svg",
        link: "/profile/*",
        linkToRedirect: "/profile"
    },
]

export const studyComponents = [
    {
        id: 2,
        name: "RoadMaps",
        component: <RoadMapPage />,
        img: 'road-map-icon.svg',
        link: "/roadmaps",
        linkToRedirect: "/roadmaps",
    },
    {
        id: 3,
        name: "Courses",
        component: <CoursesPage />,
        img: 'hat_icon.svg',
        link: "/courses/*",
        linkToRedirect: "/courses",
    },
    {
        id: 4,
        name: "Classes",
        component: <ClassPage />,
        img: 'homework_icon.svg',
        link: "/classes/*",
        linkToRedirect: "/classes",
    },
    {
        id: 5,
        name: "Dictionary",
        component: <DictionaryPage />,
        img: 'dictionary_icon.svg',
        link: "/dictionary",
        linkToRedirect: "/dictionary",
    },
]

export const settingComponents = [
    {
        id: 7,
        name: "Issue Report",
        component: <IssueReportPage />,
        img: 'problem-icon.svg',
        link: "/issues",
        linkToRedirect: "/issues",
    },
    {
        id: 8,
        name: "Log Out",
        component: <LogoutPage />,
        img: 'close_sidebar.svg',
        link: "/logout",
        linkToRedirect: "/logout",
    },
]

export const adminUserComponents = [
    {
        id: 9,
        name: "Members",
        component: <MemberPage />,
        img: 'members.svg',
        link: "/",
        linkToRedirect: "/admin",
    },
    {
        id: 10,
        name: "Roles",
        component: <RolePage />,
        img: 'role-user.svg',
        link: "/roles/*",
        linkToRedirect: "/admin/roles",
    },
    {
        id: 11,
        name: "Issue Reports",
        component: <IssueReportPageAdmin/>,
        img: 'problem-icon.svg',
        link: "/issues/*",
        linkToRedirect: "/admin/issues",
    },
]

export const adminStudyComponents = [
    {
        id: 12,
        name: "Classes",
        component: <ClassPageAdmin />,
        img: 'class-icon.svg',
        link: "/classes/*",
        linkToRedirect: "/admin/classes",
    },
    {
        id: 13,
        name: "Courses",
        component: <CoursePageAdmin />,
        img: 'hat_icon.svg',
        link: "/courses/*",
        linkToRedirect: "/admin/courses",
    },
    {
        id: 14,
        name: "Questions",
        component: <QuestionPageAdmin />,
        img: 'question-icon.svg',
        link: "/questions/*",
        linkToRedirect: "/admin/questions",
    }
]

export const redirectComponents = [
    {
        id: 15,
        name: "Dash Broad",
        component: <HomePage />,
        img: 'sync-icon.svg',
        link: "/",
        linkToRedirect: CLIENT_URL,
    },
    {
        id: 16,
        name: "Log Out",
        component: <LogoutPage />,
        img: 'close_sidebar.svg',
        link: "/logout",
        linkToRedirect: "/logout",
    },
]

export const teacherComponents = [
    {
        id: 17,
        name: "Classes",
        component: <ClassPageTeacher />,
        img: 'class-icon.svg',
        link: "/*",
        linkToRedirect: "/teacher",
    },
    {
        id: 18,
        name: "Courses",
        component: <CoursePageTeacher/>,
        img: 'hat_icon.svg',
        link: "/courses/*",
        linkToRedirect: "/teacher/courses",
    },
    {
        id: 19,
        name: "Questions",
        component: <QuestionPageTeacher/>,
        img: 'question-icon.svg',
        link: "/questions/*",
        linkToRedirect: "/teacher/questions",
    }
    
]


export const teacherMiddleComponents =[
    {
        id: 21,
        name: "Profile",
        component: <ProfilePage />,
        img: "user-profile.svg",
        link: "/profile/*",
        linkToRedirect: "/teacher/profile"
    },
    ,
    {
        id: 20,
        name: "RoadMaps",
        component: <RoadMapPage />,
        img: 'road-map-icon.svg',
        link: "/roadmaps",
        linkToRedirect: "/teacher/roadmaps",
    },
    {
        id: 22,
        name: "Dictionary",
        component: <DictionaryPage />,
        img: 'dictionary_icon.svg',
        link: "/dictionary",
        linkToRedirect: "/teacher/dictionary",
    }
]

export const teacherLastComponents = [
    {
        id: 23,
        name: "Issue Report",
        component: <IssueReportPage />,
        img: 'problem-icon.svg',
        link: "/issues",
        linkToRedirect: "/teacher/issues",
    },
    {
        id: 24,
        name: "Log Out",
        component: <LogoutPage />,
        img: 'close_sidebar.svg',
        link: "/logout",
        linkToRedirect: "/teacher/logout",
    }
]