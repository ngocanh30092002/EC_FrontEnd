import HomePage from './Home/HomePage';
import BookmarksPage from './Bookmarks/BookmarksPage';
import ToeicsPage from './Toeics/ToeicsPage';
import CoursesPage from './Courses/CoursesPage';
import HomeworkPage from './Homework/HomeworkPage';
import DictionaryPage from './Dictionary/DictionaryPage';
import SettingPage from './Setting/SettingPage';
import HelpCenterPage from './HelpCenter/HelpCenterPage';
import LogoutPage from './Logout/LogoutPage';
import ProfilePage from './Profile/ProfilePage';

export const homeComponents = [
    {
        id: 0,
        name: "Home",
        component: <HomePage/>,
        img: 'home_icon.svg',
        link: "/",
        linkToRedirect: "/",
    },
    {
        id: 1,
        name: "Profile",
        component: <ProfilePage/>,
        img: "user-profile.svg",
        link:"/profile/*",
        linkToRedirect: "/profile"
    },
    {
        id: 2,
        name: "Bookmarks",
        component: <BookmarksPage/>,
        img: 'bookmark_icon.svg',
        link: "/bookmarks",
        linkToRedirect: "/bookmarks",
    }
]

export const studyComponents = [
    {
        id: 3,
        name: "Toeics",
        component: <ToeicsPage/>,
        img: 'toeic_icon.svg',
        link: "/toeics",
        linkToRedirect: "/toeics",
    },
    {
        id: 4,
        name: "Courses",
        component: <CoursesPage/>,
        img: 'hat_icon.svg',
        link: "/courses",
        linkToRedirect: "/courses",
    },
    {
        id: 5,
        name: "Homework",
        component: <HomeworkPage/>,
        img: 'homework_icon.svg',
        link: "/homework",
        linkToRedirect: "/homework",
    },
    {
        id: 6,
        name: "Dictionary",
        component: <DictionaryPage/>,
        img: 'dictionary_icon.svg',
        link: "/dictionary",
        linkToRedirect: "/dictionary",
    },
]

export const settingComponents = [
    {
        id: 7,
        name: "Setting",
        component: <SettingPage/>,
        img: 'setting.svg',
        link: "/setting",
        linkToRedirect: "/setting",
    },
    {
        id: 8,
        name: "Help Center",
        component: <HelpCenterPage/>,
        img: 'question_icon.svg',
        link: "/helpcenter",
        linkToRedirect: "/helpcenter",
    },
    {
        id: 9,
        name: "Log Out",
        component: <LogoutPage/>,
        img: 'close_sidebar.svg',
        link: "/logout",
        linkToRedirect: "/logout",
    },
 ]