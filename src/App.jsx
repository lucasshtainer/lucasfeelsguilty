import { Routes, Route } from 'react-router-dom';
import { LettersProvider } from './context/LettersContext.jsx';
import Layout from './layout/Layout.jsx';
import Home from './pages/Home.jsx';
import LetterPage from './pages/LetterPage.jsx';
import Admin from './pages/admin/Admin.jsx';

export default function App() {
  return (
    <LettersProvider>
      <Routes>
        <Route path="/admin/*" element={<Admin />} />
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="letter/:slug" element={<LetterPage />} />
        </Route>
      </Routes>
    </LettersProvider>
  );
}
