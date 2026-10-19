import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './components/Home';
import Projects from './components/Projects';
import TaskManager from './components/TaskManager';
import Contact from './components/Contact';
import NotFound from './components/NotFound';
import Footer from './components/Footer';
import './App.css';

function App() {
  // useState variable for dark/light mode theme toggle across entire application
  const [darkMode, setDarkMode] = useState(false);

  // Student and academic portfolio data
  const studentInfo = {
    name: 'Parth Patel',
    id: '24CS069',
    department: 'Department of Computer Science and Engineering',
    institution: 'Chandubhai S Patel Institute of Technology (CSPIT), CHARUSAT',
    academicYear: '2025-26',
    email: '24cs069@charusat.edu.in',
    githubUrl: 'https://github.com/24CS069Parth',
    bio: 'Third-year B.Tech Computer Science and Engineering student at CSPIT, Charusat. Passionate about modern web architecture, component-driven design, and building scalable full-stack web applications. Currently mastering React, Vite, Node.js, and advanced development frameworks through hands-on coursework.',
  };

  // Skills array passed to Home -> Skills component via props
  const skills = [
    'React.js (React Router v6)',
    'State Management (useState)',
    'JavaScript (ES6+)',
    'JSX & Component Architecture',
    'Controlled Forms & Real-time Binding',
    'HTML5 & Modern CSS3',
    'Vite Build Tool',
    'Node.js & npm',
    'Git & GitHub Workflow',
  ];

  // Connected projects list maintaining thread across practicals
  const projects = [
    {
      title: 'Practical 1: Student Portfolio Platform',
      description: 'Component-based static portfolio built using Vite and React, demonstrating modular architecture and dynamic prop passing.',
      tech: ['React', 'Vite', 'CSS3', 'JSX'],
      status: 'Completed (Prac 1)',
    },
    {
      title: 'Practical 2: SPA Routing & State Management',
      description: 'Multi-page single-page application with client-side routing (React Router v6), controlled form inputs, dynamic state toggling, and live previews.',
      tech: ['React Router v6', 'useState', 'SPA Navigation', 'Controlled Forms'],
      status: 'Current (Prac 2)',
    },
    {
      title: 'Practical 3-13: Full-Stack Developer Platform',
      description: 'Progressive end-product expanding into component lifecycles, hooks, context API, backend Express/MongoDB integration, and deployment.',
      tech: ['MERN Stack', 'Express.js', 'MongoDB', 'REST APIs'],
      status: 'Upcoming Modules',
    },
  ];

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  return (
    <div className={`portfolio-app ${darkMode ? 'dark-theme' : 'light-theme'}`}>
      {/* Navigation bar with route Links and theme toggle */}
      <NavBar darkMode={darkMode} onToggleTheme={toggleDarkMode} />

      {/* Main Single Page Application Route Outlet */}
      <main className="portfolio-container">
        <Routes>
          <Route path="/" element={<Home studentInfo={studentInfo} skills={skills} />} />
          <Route path="/tasks" element={<TaskManager />} />
          <Route path="/projects" element={<Projects projectList={projects} />} />
          <Route path="/contact" element={<Contact studentInfo={studentInfo} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {/* Academic Footer */}
      <Footer
        studentId={studentInfo.id}
        academicYear={studentInfo.academicYear}
        email={studentInfo.email}
        githubUrl={studentInfo.githubUrl}
      />
    </div>
  );
}

export default App;
