import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './components/Home';
import TaskList from './components/TaskList';
import TaskDetail from './components/TaskDetail';
import DecompositionView from './components/DecompositionView';
import './App.css';

function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tasks');
      const data = await response.json();
      if (data.success) {
        setTasks(data.data);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Router>
      <div className="App min-h-screen bg-gray-50">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/tasks" element={<TaskList tasks={tasks} loading={loading} onRefresh={fetchTasks} />} />
            <Route path="/task/:id" element={<TaskDetail onTaskUpdated={fetchTasks} />} />
            <Route path="/decomposition/:id" element={<DecompositionView />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
