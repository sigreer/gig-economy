import React from 'react';
import GigTable from './components/GigTable';
import './App.css';
import './css/index.css';

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="text-3xl font-bold underline">Gigs</h1>
      </header>
      <main className="App-body">
        <GigTable/>
      </main>
    </div>
  );
};

export default App;
