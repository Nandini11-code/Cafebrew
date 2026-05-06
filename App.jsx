import { useEffect, useMemo, useState } from 'react'
import './App.css'

const brewPresets = [
  {
    name: 'Espresso',
    duration: 30,
    grind: 'Fine grind',
    ratio: '1:2 ratio',
    note: 'Short, focused extraction for a rich shot.',
  },
  {
    name: 'French Press',
    duration: 240,
    grind: 'Coarse grind',
    ratio: '1:15 ratio',
    note: 'A slow steep for a full-bodied cup.',
  },
  {
    name: 'AeroPress',
    duration: 90,
    grind: 'Medium-fine grind',
    ratio: '1:13 ratio',
    note: 'A clean, quick brew with gentle pressure.',
  },
]

const customers = [
  {
    id: 1,
    name: 'Aarav',
    order: 'Espresso',
  },
  {
    id: 2,
    name: 'Mira',
    order: 'French Press',
  },
  {
    id: 3,
    name: 'Kabir',
    order: 'AeroPress',
  },
]

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

function App() {
  const [selectedBrew, setSelectedBrew] = useState(brewPresets[0])
  const [secondsLeft, setSecondsLeft] = useState(brewPresets[0].duration)
  const [isRunning, setIsRunning] = useState(false)
  const [activeCustomer, setActiveCustomer] = useState(null)
  const [customerStatuses, setCustomerStatuses] = useState({})
  const [readyNotification, setReadyNotification] = useState('')

  const progress = useMemo(() => {
    return ((selectedBrew.duration - secondsLeft) / selectedBrew.duration) * 100
  }, [secondsLeft, selectedBrew.duration])

  useEffect(() => {
    if (!isRunning) return undefined

    const timerId = setInterval(() => {
      setSecondsLeft((currentSeconds) => {
        if (currentSeconds <= 1) {
          setIsRunning(false)

          if (activeCustomer) {
            setCustomerStatuses((currentStatuses) => ({
              ...currentStatuses,
              [activeCustomer.id]: 'Ready',
            }))
            setReadyNotification(`${activeCustomer.name}'s ${activeCustomer.order} is ready.`)
          }

          return 0
        }

        return currentSeconds - 1
      })
    }, 1000)

    return () => clearInterval(timerId)
  }, [activeCustomer, isRunning])

  function startBrew(brew) {
    setSelectedBrew(brew)
    setSecondsLeft(brew.duration)
    setIsRunning(true)
    setActiveCustomer(null)
    setReadyNotification('')
  }

  function brewCustomerOrder(customer) {
    const brew = brewPresets.find((preset) => preset.name === customer.order)

    if (!brew) return

    setSelectedBrew(brew)
    setSecondsLeft(brew.duration)
    setIsRunning(true)
    setActiveCustomer(customer)
    setReadyNotification('')
    setCustomerStatuses((currentStatuses) => ({
      ...currentStatuses,
      [customer.id]: 'Preparing',
    }))
  }

  function resetTimer() {
    setSecondsLeft(selectedBrew.duration)
    setIsRunning(false)
  }

  const timerStatus = secondsLeft === 0 ? 'Ready to pour' : isRunning ? 'Brewing now' : 'Paused'

  return (
    <main className="app">
        <section className="intro">
          <p className="eyebrow">Coffee Brew Timer</p>
          <h1>Pick a method and start the perfect countdown.</h1>
          <p className="intro-text">
            A simple React timer with presets for Espresso, French Press, and AeroPress.
          </p>
        </section>

        <section className="timer-card" aria-label="Brew timer">
          <div className="timer-header">
            <div>
              <p className="label">Current brew</p>
              <h2>{selectedBrew.name}</h2>
            </div>
            <span className="status">{timerStatus}</span>
          </div>

          <div className="time-display" aria-live="polite">
            {formatTime(secondsLeft)}
          </div>

          <div className="progress-track" aria-hidden="true">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>

          <div className="brew-details">
            <span>{selectedBrew.grind}</span>
            <span>{selectedBrew.ratio}</span>
            <span>{formatTime(selectedBrew.duration)}</span>
          </div>

          <p className="brew-note">{selectedBrew.note}</p>

          <div className="timer-actions">
            <button type="button" onClick={() => setIsRunning((running) => !running)}>
              {isRunning ? 'Pause' : 'Resume'}
            </button>
            <button type="button" className="secondary" onClick={resetTimer}>
              Reset
            </button>
          </div>
        </section>

        <section className="preset-grid" aria-label="Brew presets">
          {brewPresets.map((brew) => (
            <button
              type="button"
              className={brew.name === selectedBrew.name ? 'preset active' : 'preset'}
              key={brew.name}
              onClick={() => startBrew(brew)}
            >
              <span>{brew.name}</span>
              <strong>{formatTime(brew.duration)}</strong>
            </button>
          ))}
        </section>

        <section className="customer-section" aria-label="Customer orders">
          <div className="section-header">
            <div>
              <p className="label">Customer Orders</p>
              <h2>Prepare coffee as customers arrive.</h2>
            </div>
            {readyNotification && (
              <p className="ready-notification" role="status">
                {readyNotification}
              </p>
            )}
          </div>

          <div className="customer-grid">
            {customers.map((customer) => {
              const status = customerStatuses[customer.id] || 'Waiting'

              return (
                <article className="customer-card" key={customer.id}>
                  <div>
                    <strong>{customer.name}</strong>
                    <span>{customer.order}</span>
                  </div>
                  <button type="button" onClick={() => brewCustomerOrder(customer)}>
                    {status}
                  </button>
                </article>
              )
            })}
          </div>
        </section>
    </main>
  )
}

export default App
