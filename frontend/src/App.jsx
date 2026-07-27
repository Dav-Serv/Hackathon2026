import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <div className="mx-auto max-w-3xl text-center">
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">
          React + Tailwind CSS
        </p>
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Frontend siap dikembangkan
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-slate-400">
          Vite, React, dan Tailwind CSS sudah terpasang di folder frontend.
        </p>
        <button
          type="button"
          className="mt-10 rounded-xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
          onClick={() => setCount((value) => value + 1)}
        >
          Klik: {count}
        </button>
      </div>
    </main>
  )
}

export default App
