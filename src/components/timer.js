import React, { Component } from 'react';

export default class Timer extends Component {
  // Initial State - Lengths are in minutes - Timer is off and type is session
  constructor(props) {
    super(props);
    this.state = {
      breakLength: 5,
      sessionLength: 25,
      timeLeft: '25:00',
      timerType: 'Session',
      timerStatus: 'off',
    };
    // Binding methods to component
    this.updateInitialSession = this.updateInitialSession.bind(this);
    this.changeTimerType = this.changeTimerType.bind(this);
    this.setTimeLeft = this.setTimeLeft.bind(this);
    this.resumeTimer = this.resumeTimer.bind(this);
    this.startTimer = this.startTimer.bind(this);
    this.setTimer = this.setTimer.bind(this);
    this.onPlayPauseClick = this.onPlayPauseClick.bind(this);
    this.onResetClick = this.onResetClick.bind(this);
  }
  // Updates initial session time with session length buttons. Only updates when timer is off. 
  updateInitialSession(type) {
    if (this.state.timerStatus === 'off' && type === 'sessionLength') {
      this.setState({ timeLeft: `${this.state.sessionLength}:00`});
    }
  }
  // Updates timer type length when corresponding button is pressed (+-) 
  onLengthClick(operator, type) {
    // Ensures length values don't out of range (1-60)
    if (operator === '+' && this.state[type] > 59) return;
    if (operator === '-' && this.state[type] <= 1) return;
    // Adding or subtracting 1 from current state based on previous state 
    this.setState(prevState => {
      return {[type]: operator === '+' ? prevState[type] + 1 : prevState[type] - 1};
    }, () => this.updateInitialSession(type));
  }
  // Switches timer label and starts a new timer. Called when current timer reaches 0:00
  changeTimerType() {
    let timerType;
    if (this.state.timerType === 'Session') {
      timerType = 'Break';
      this.startTimer(this.state.breakLength * 60);
    } else {
      timerType = 'Session';
      this.startTimer(this.state.sessionLength * 60);
    }
    this.setState({ timerType });
  }
  // Takes seconds, formats, and setsState to display timeLeft for current timer
  setTimeLeft(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainderSeconds = seconds % 60;
    const timeLeft = `${minutes}:${remainderSeconds < 10 ? '0': ''}${remainderSeconds}`;
    this.setState({ timeLeft });
    document.title = timeLeft;
  }
  /* Takes a future timestamp (millisecs from Date.now() + millisecs of timer length)
     and subtracts Date.now() from it every second. Updates state to show time left.
     When timer is done - plays audio, clears timer, switches timer type, */
  setTimer(then) {
    this.timer = setInterval(() => {
      const secondsLeft = Math.round((then - Date.now()) / 1000);
      if (secondsLeft < 0) {
        clearInterval(this.timer);
        this.timerAudio.play();
        this.changeTimerType();
        return;
      }
      this.setTimeLeft(secondsLeft);
    }, 1000);
  }
  // Sets a then value using minutes and seconds on state.timeLeft - starts new timer
  resumeTimer() {
    let [minutes, seconds] = this.state.timeLeft.split(':');
    minutes = parseInt(minutes);
    seconds = parseInt(seconds);
    const then = Date.now() + (minutes * 60 + seconds) * 1000;
    this.setTimer(then);
  }
  // starts new timer using passed seconds (sessionLength * 60)
  startTimer(seconds) {
    const then = Date.now() + seconds * 1000;
    this.setTimeLeft(seconds);
    this.setTimer(then);
  }
  /* Updates state.TimerStatus based on its current value. 
     If running - clear timer and set TimerStatus to paused
       If paused - make new timer using state.timeLeft
       If off - make new timer using sessionLength (*60) 
         set TimerStatus to running either case */
  onPlayPauseClick() {
    if (this.state.timerStatus === 'running') {
      this.setState({ timerStatus: 'paused'})
      clearInterval(this.timer);
    } else {
      if (this.state.timerStatus === 'paused') {
        this.resumeTimer();
      } else {
        this.startTimer(this.state.sessionLength * 60);
      }
      this.setState({ timerStatus: 'running'});
    }
  }
  // Clears timer and resets state to defaults, rewinds audio
  onResetClick() {
    clearInterval(this.timer);
    this.setState ({
        breakLength: 5,
        sessionLength: 25,
        timeLeft: '25:00',
        timerType: 'Session',
        timerStatus: 'off'
    });
    document.title = 'Pomodoro Clock | Ricardo Ledesma';
    if (!this.timerAudio.paused) {
      this.timerAudio.pause();
      this.timerAudio.currentTime = 0
    }
  }
  // CSS grid for layout. Four sections: one for each length, timer, and timerButtons
  render() {
    // Each length click passes it's operation and type. innerText is taken from state. Audio element has ref.
    return (
     <div className='wrapper'>
       <div className='break'>
         <p id='break-label'>Break Length</p>
         <button onClick={this.onLengthClick.bind(this, '-', 'breakLength')} id='break-decrement'>
           <i className="fas fa-arrow-down fa-2x" />
         </button>
         <span id='break-length'>{this.state.breakLength}</span>
         <button onClick={this.onLengthClick.bind(this, '+', 'breakLength')} id='break-increment'>
           <i className="fas fa-arrow-up fa-2x" />
         </button>
       </div>
       <div className='session'>
         <p id='session-label'>Session Length</p>
         <button onClick={this.onLengthClick.bind(this, '-', 'sessionLength')} id='session-decrement'>
           <i className="fas fa-arrow-down fa-2x" />
         </button>
         <span id='session-length'>{this.state.sessionLength}</span>
         <button onClick={this.onLengthClick.bind(this, '+', 'sessionLength')} id='session-increment'>
           <i className="fas fa-arrow-up fa-2x" />
         </button>
       </div>
       <div className='timer'>
         <p id='timer-label'>{this.state.timerType}</p>
         <div id='time-left'>{this.state.timeLeft}</div>
       </div>
       <div className='timerButtons'>
         <button onClick={this.onPlayPauseClick}id='start_stop'>
           <i className="fas fa-play fa-lg" />
           <i className="fas fa-pause fa-lg" />
         </button>
         <button onClick={this.onResetClick} id='reset'><i className="fas fa-sync-alt fa-lg"></i></button>
       </div>
       <audio id='beep' preload='auto' ref={elem => this.timerAudio = elem} src='http://soundbible.com/mp3/Fire_pager-jason-1283464858.mp3'></audio>
     </div>
    );
  }
}
