import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './components/HomePage';
import { SeoHead } from './components/SeoHead';
import en from './messages/en.json';
import zh from './messages/zh.json';

export function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <SeoHead locale="en" messages={en} />
            <Layout locale="en" messages={en}>
              <HomePage messages={en} />
            </Layout>
          </>
        }
      />
      <Route
        path="/zh"
        element={
          <>
            <SeoHead locale="zh" messages={zh} />
            <Layout locale="zh" messages={zh}>
              <HomePage messages={zh} />
            </Layout>
          </>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
