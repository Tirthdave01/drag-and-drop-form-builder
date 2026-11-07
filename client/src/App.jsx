import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import FormsList from './components/dashboard/FormsList';
import BuilderLayout from './components/builder/BuilderLayout';
import FormResponsesView from './components/dashboard/FormResponsesView';
import PublicFormPage from './components/public/PublicFormPage';
import AuthView from './components/auth/AuthView';

function AppContent() {
  const { user, loading } = useAuth();

  // Navigation state: 'dashboard' | 'builder' | 'responses'
  const [currentView, setCurrentView] = useState('dashboard');
  const [activeFormId, setActiveFormId] = useState(null);

  // Check URL path on mount (e.g. if someone opens /f/slug)
  const pathname = window.location.pathname;
  const publicSlugMatch = pathname.match(/^\/f\/([^/]+)/);

  if (publicSlugMatch) {
    const slug = publicSlugMatch[1];
    return <PublicFormPage slug={slug} />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500 font-medium text-sm">
          <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <span>Starting FormCraft...</span>
        </div>
      </div>
    );
  }

  // If not logged in, show Auth
  if (!user) {
    return <AuthView />;
  }

  // Builder View (full screen workspace)
  if (currentView === 'builder') {
    return (
      <BuilderLayout
        formId={activeFormId}
        onBackToDashboard={() => {
          setActiveFormId(null);
          setCurrentView('dashboard');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar
        currentView={currentView}
        onNavigate={(view, formId = null) => {
          setActiveFormId(formId);
          setCurrentView(view);
        }}
      />

      {currentView === 'dashboard' && (
        <FormsList
          onCreateForm={() => {
            setActiveFormId(null);
            setCurrentView('builder');
          }}
          onEditForm={(id) => {
            setActiveFormId(id);
            setCurrentView('builder');
          }}
          onViewResponses={(id) => {
            setActiveFormId(id);
            setCurrentView('responses');
          }}
        />
      )}

      {currentView === 'responses' && (
        <FormResponsesView
          formId={activeFormId}
          onBack={() => {
            setActiveFormId(null);
            setCurrentView('dashboard');
          }}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
