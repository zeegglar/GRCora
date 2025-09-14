import React from 'react';

const EnvironmentNotice: React.FC = () => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 p-8">
      <div className="w-full max-w-2xl bg-slate-800 border border-red-500/50 rounded-lg p-8 text-center">
        <h1 className="text-3xl font-bold text-red-400">Configuration Error</h1>
        <p className="text-slate-300 mt-4">
          The application is missing its connection credentials for the backend.
        </p>
        <p className="text-slate-400 mt-2">
          This is expected during first-time setup.
        </p>
        <div className="mt-6 text-left bg-slate-900 p-4 rounded-lg">
          <h2 className="text-xl font-semibold text-white">How to Fix:</h2>
          <ol className="list-decimal list-inside mt-3 space-y-2 text-slate-300">
            <li>
              In the root directory of this project, create a file named <code className="bg-slate-700 px-1.5 py-0.5 rounded font-mono text-sm text-yellow-300">.env</code>
            </li>
            <li>
              Open the new <code className="bg-slate-700 px-1.5 py-0.5 rounded font-mono text-sm text-yellow-300">.env</code> file and add the following content, replacing the placeholders with your actual Supabase credentials:
            </li>
          </ol>
          <pre className="bg-black/50 p-4 rounded-md mt-3 text-sm text-slate-200 overflow-x-auto">
            <code>
              VITE_SUPABASE_URL="YOUR_SUPABASE_PROJECT_URL"<br />
              VITE_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
            </code>
          </pre>
          <p className="text-slate-400 mt-4 text-sm">
            You can find these keys in your Supabase project dashboard under **Project Settings &gt; API**. For more detailed instructions, please see the <code className="bg-slate-700 px-1.5 py-0.5 rounded font-mono text-sm text-yellow-300">README.md</code> file.
          </p>
        </div>
        <p className="text-slate-500 mt-6 text-sm">
          Once you have saved the `.env` file, please restart the development server.
        </p>
      </div>
    </div>
  );
};

export default EnvironmentNotice;
