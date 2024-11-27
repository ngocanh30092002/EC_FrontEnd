import ClassPage from './Class/ClassPage';
import CoursesPage from './Courses/CoursesPage';
import DictionaryPage from './Dictionary/DictionaryPage';
import HomePage from './Home/HomePage';
import LogoutPage from './Logout/LogoutPage';
import ProfilePage from './Profile/ProfilePage';
import ToeicsPage from './Toeics/ToeicsPage';
import { CLIENT_URL } from '~/GlobalConstant.js';

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
        name: "Toeics",
        component: <ToeicsPage />,
        img: 'toeic_icon.svg',
        link: "/toeics",
        linkToRedirect: "/toeics",
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
        name: "Log Out",
        component: <LogoutPage />,
        img: 'close_sidebar.svg',
        link: "/logout",
        linkToRedirect: "/logout",
    },
]

export const adminUserComponents = [
    {
        id: 8,
        name: "Members",
        component: <div>Hi</div>,
        img: 'close_sidebar.svg',
        link: "/admin/*",
        linkToRedirect: "/admin",
    },
    {
        id: 9,
        name: "Roles",
        component: <div>Hi</div>,
        img: 'close_sidebar.svg',
        link: "/admin/roles/*",
        linkToRedirect: "/admin/roles",
    },
]

export const adminStudyComponents = [
    {
        id: 10,
        name: "Classes",
        component: <div>Hi</div>,
        img: 'close_sidebar.svg',
        link: "/admin/classes/*",
        linkToRedirect: "/admin/classes",
    },
    {
        id: 11,
        name: "Courses",
        component: <div>Hi</div>,
        img: 'close_sidebar.svg',
        link: "/admin/courses/*",
        linkToRedirect: "/admin/courses",
    }
]

export const adminRedirectComponents = [
    {
        id: 12,
        name: "Dash Broad",
        component: <LogoutPage />,
        img: 'sync-icon.svg',
        link: "/admin/*",
        linkToRedirect: CLIENT_URL,
    },
    {
        id: 13,
        name: "Log Out",
        component: <HomePage />,
        img: 'close_sidebar.svg',
        link: "/logout",
        linkToRedirect: "/logout",
    },
]