import React from 'react';
import ReactDOM from 'react-dom';
import Timer from './components/timer';

const App = () => {
  return (
    <div className='container'>
      <h2 className='title'>React Pomodoro Clock</h2>
      <Timer />
      <p className='bio'>Coded by <a href='https://github.com/RicardoL-AFati/fccFrontEnd-pomodoroClock'>Ricardo Ledesma</a></p>
    </div>
  );
}

ReactDOM.render(<App />, document.querySelector('.root'));