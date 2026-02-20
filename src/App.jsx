import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Library from './pages/Library';
import Calendar from './pages/Calendar';
import Coach from './pages/Coach';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'dashboard' && <Dashboard />}
      {activeTab === 'library' && <Library />}
      {activeTab === 'calendar' && <Calendar />}
      {activeTab === 'coach' && <Coach />}
    </Layout>
  );
}

export default App;
