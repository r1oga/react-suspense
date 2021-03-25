// Simple Data-fetching
// http://localhost:3000/isolated/exercise/01.js

import * as React from 'react'
import {
  fetchPokemon,
  PokemonDataView,
  PokemonErrorBoundary,
  PokemonInfoFallback
} from '../pokemon'
import { createResource } from 'utils'

// const createResource = promise => {
//   let status = 'pending'
//   let result = promise.then(
//     resolved => {
//       status = 'resolved'
//       result = resolved
//     },
//     rejected => {
//       status = 'rejected'
//       result = rejected
//     }
//   )
//   return {
//     read: () => {
//       if (['pending', 'rejected'].includes(status)) throw result
//       if (status === 'resolved') return result
//       throw new Error('this should be impossible')
//     }
//   }
// }
const pokemonResource = createResource(fetchPokemon('pikachu'))

function PokemonInfo() {
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

function App() {
  return (
    <div className="pokemon-info-app">
      <div className="pokemon-info">
        <PokemonErrorBoundary>
          <React.Suspense fallback={<PokemonInfoFallback name="pikachu" />}>
            <PokemonInfo />
          </React.Suspense>
        </PokemonErrorBoundary>
      </div>
    </div>
  )
}

export default App
