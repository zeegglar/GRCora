import React from 'react';
import ImprovedApp from './components/ImprovedApp';
import { isSupabaseConfigured } from './services/supabaseClient';
import EnvironmentNotice from './components/setup/EnvironmentNotice';
import './index.css';

const ImprovedGRCora: React.FC = () => {
  return (
    <div className="improved-grcora">
      {!isSupabaseConfigured ? (
        <EnvironmentNotice />
      ) : (
        <ImprovedApp />
      )}
    </div>
  );
};

export default ImprovedGRCora;