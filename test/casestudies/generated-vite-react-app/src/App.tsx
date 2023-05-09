import React, { useState } from 'react'
import logo from './logo.svg'
import './App.css'
import { tz3qVl7Hb4GkA7qTL } from './random_code'

function logSomething(msg: string): void {
  console.log(msg);
}

function computeC(x: number, y: number): number {
  if (x > 0 || y > 0) {
    return 0;
  }

  if (x > 10) {
    return y + 2;
  } else {
    return y + 3;
  }
}

function computeB(x: number, y: number): number {
  if (x > 5) {
    return y + 4;
  } else if (x > 5 && y === 123) {
    return y + 5;
  } else {
    return y + 6;
  }
}

function computeA(x: number, y: number): number {
  const b1 = computeB(x + 1, y);
  const b2 = computeB(5, y);
  const c1 = computeC(1, 1);
  return b1 + b2 + c1;
}

function App() {
  const [count, setCount] = useState(0)

  const r = computeA(count, count);
  logSomething("Hello New World!");

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Hello Vite + React!</p>
        <p>
          <button onClick={() => {
            setCount((count) => count + 1);
            tz3qVl7Hb4GkA7qTL();
          // This space is needed as otherwise it is a delimiter string of tempita
          } }>
            count is: {count} and r is: {r}
          </button>
        </p>
        <p>
          Edit <code>App.tsx</code> and save to test HMR updates. Fooo!
        </p>
        <p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          {' | '}
          <a
            className="App-link"
            href="https://vitejs.dev/guide/features.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vite Docs
          </a>
        </p>
      </header>
    </div>
  )
}

export default App
