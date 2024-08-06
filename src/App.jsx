import { Route, Routes} from 'react-router-dom'
import './App.css'
import LoginPage from './components/LoginComponent/LoginPage'
import MainPage from './components/MainComponent/MainPage'
import ManagerPage from './components/ManagerComponent/ManagePage'
function App() {
  return (
    <>
      <Routes>
        <Route path='/' element= {<LoginPage/>}/>
        <Route path='/main' element = {<MainPage/>}/>
        <Route path='/manage' element = {<ManagerPage/>}/>
      </Routes>
    </>
  )
}

export default App
