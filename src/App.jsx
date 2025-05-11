import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { EditorPage } from './pages';

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

