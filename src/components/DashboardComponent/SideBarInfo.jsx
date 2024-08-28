import HomePage from './Home/HomePage';
import BookmarksPage from './Bookmarks/BookmarksPage';
import ToeicsPage from './Toeics/ToeicsPage';
import CoursesPage from './Courses/CoursesPage';
import HomeworkPage from './Homework/HomeworkPage';
import DictionaryPage from './Dictionary/DictionaryPage';
import SettingPage from './Setting/SettingPage';
import HelpCenterPage from './HelpCenter/HelpCenterPage';
import LogoutPage from './Logout/LogoutPage';

export const homeComponents = [
    {
        name: "Home",
        component: <HomePage/>,
        img: 'home_icon.svg',
        link: "/",
    },
    {
        name: "Bookmarks",
        component: <BookmarksPage/>,
        img: 'bookmark_icon.svg',
        link: "/bookmarks"
    }
]

export const studyComponents = [
    {
        name: "Toeics",
        component: <ToeicsPage/>,
        img: 'toeic_icon.svg',
        link: "/toeics"
    },
    {
        name: "Courses",
        component: <CoursesPage/>,
        img: 'hat_icon.svg',
        link: "/courses"
    },
    {
        name: "Homework",
        component: <HomeworkPage/>,
        img: 'homework_icon.svg',
        link: "/homework"
    },
    {
        name: "Dictionary",
        component: <DictionaryPage/>,
        img: 'dictionary_icon.svg',
        link: "/dictionary"
    },
]

export const settingComponents = [
    {
        name: "Setting",
        component: <SettingPage/>,
        img: 'setting.svg',
        link: "/setting"
    },
    {
        name: "Help Center",
        component: <HelpCenterPage/>,
        img: 'question_icon.svg',
        link: "/helpcenter"
    },
    {
        name: "Log Out",
        component: <LogoutPage/>,
        img: 'close_sidebar.svg',
        link: "/logout"
    },
 ]