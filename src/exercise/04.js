// Cache resources
// http://localhost:3000/isolated/exercise/04.js

import * as React from 'react'
import {
  fetchPokemon,
  PokemonInfoFallback,
  PokemonForm,
  PokemonDataView,
  PokemonErrorBoundary
} from '../pokemon'
import { createResource } from '../utils'

function PokemonInfo({ pokemonResource }) {
  const pokemon = pokemonResource.read()
  return (
    <div>
      <div className="pokemon-info__img-wrapper">
        <img src={pokemon.image} alt={pokemon.name} />
      </div>
      <PokemonDataView pokemon={pokemon} />
    </div>
  )
}

const SUSPENSE_CONFIG = {
  timeoutMs: 4000,
  busyDelayMs: 300,
  busyMinDurationMs: 700
}

const PokemonCacheContext = React.createContext()

const PokemonCacheProvider = ({ children, cacheTime }) => {
  const cache = React.useRef({})
  const expirations = React.useRef({})

  React.useEffect(() => {
    const interval = setInterval(() => {
      Object.entries(expirations.current).forEach(([name, cacheTime]) => {
        if (cacheTime < Date.now()) {
          delete cache.current[name]
        }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const getPokemonResource = React.useCallback(
    pokemonName => {
      const lowerName = pokemonName.toLowerCase()
      let pokemonResource = cache.current[lowerName]
      if (!pokemonResource) {
        pokemonResource = createPokemonResource(lowerName)
        cache.current[lowerName] = pokemonResource
      }

      expirations.current[lowerName] = Date.now() + cacheTime

      return pokemonResource
    },
    [cacheTime]
  )

  return (
    <PokemonCacheContext.Provider value={getPokemonResource}>
      {children}
    </PokemonCacheContext.Provider>
  )
}

const usePokemonCache = () => {
  const context = React.useContext(PokemonCacheContext)
  if (!context) {
    throw new Error(
      'usePokemonCache can only be used in a <PokemonCacheProvider />'
    )
  }

  return context
}

function createPokemonResource(pokemonName) {
  return createResource(fetchPokemon(pokemonName))
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')
  const [startTransition, isPending] = React.useTransition(SUSPENSE_CONFIG)
  const [pokemonResource, setPokemonResource] = React.useState(null)
  const getPokemonResource = usePokemonCache()

  React.useEffect(() => {
    if (!pokemonName) {
      setPokemonResource(null)
      return
    }
    startTransition(() => {
      setPokemonResource(getPokemonResource(pokemonName))
    })
  }, [pokemonName, startTransition, getPokemonResource])

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className={`pokemon-info ${isPending ? 'pokemon-loading' : ''}`}>
        {pokemonResource ? (
          <PokemonErrorBoundary
            onReset={handleReset}
            resetKeys={[pokemonResource]}>
            <React.Suspense
              fallback={<PokemonInfoFallback name={pokemonName} />}>
              <PokemonInfo pokemonResource={pokemonResource} />
            </React.Suspense>
          </PokemonErrorBoundary>
        ) : (
          'Submit a pokemon'
        )}
      </div>
    </div>
  )
}

const AppWithProvider = () => (
  <PokemonCacheProvider cacheTime={5000}>
    <App />
  </PokemonCacheProvider>
)

export default AppWithProvider
