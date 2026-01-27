import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from '@/pages/home';
import { MbtiIntro, MbtiTest, MbtiResult } from '@/pages/mbti';
import { IssueList, IssueDetail } from '@/pages/balance';
import { NewsList, NewsDetail } from '@/pages/news';
import { MainLayout } from '@/components/templates';
import { Login } from '@/pages/auth/Login';
import { Register } from '@/pages/auth/Register';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/mbti" element={<MbtiIntro />} />
          <Route path="/mbti/test" element={<MbtiTest />} />
          <Route path="/mbti/result/:type" element={<MbtiResult />} />
          <Route path="/news" element={<NewsList />} />
          <Route path="/news/:id" element={<NewsDetail />} />
          <Route path="/balance" element={<IssueList />} />
          <Route path="/balance/:id" element={<IssueDetail />} />
        </Route>
      </Routes>
    </Router>
  );
}