import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/layout/Sidebar'
import Terminal from './components/Terminal'
import Dashboard from './pages/Dashboard'
import ProjectPage from './pages/ProjectPage'
import PublishPage from './pages/PublishPage'
import DeveloperPage from './pages/DeveloperPage'
import NewProject from './pages/NewProject'

function App() {
    const [terminalOpen, setTerminalOpen] = useState(false)

    return (
        <Router>
            <div className="flex min-h-screen bg-background text-foreground" dir="rtl">
                <Sidebar onOpenTerminal={() => setTerminalOpen(true)} />
                <main className="flex-1 p-8 overflow-y-auto">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/new-project" element={<NewProject />} />
                        <Route path="/project/:id" element={<ProjectPage />} />
                        <Route path="/publish" element={<PublishPage />} />
                        <Route path="/developer" element={<DeveloperPage />} />
                    </Routes>
                </main>
                {/* Terminal at root level - visible from anywhere */}
                <Terminal isOpen={terminalOpen} onClose={() => setTerminalOpen(false)} />
            </div>
        </Router>
    )
}

export default App
