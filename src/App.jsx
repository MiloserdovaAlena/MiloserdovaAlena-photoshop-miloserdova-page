import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { EditorPage } from './pages';
import { HashRouter } from 'react-router-dom'
function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<EditorPage />} />
      </Routes>
    </HashRouter>
  )
}
export default App

