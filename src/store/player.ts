import { create } from "zustand"
import { persist } from "zustand/middleware";
import { v4 as uuid } from 'uuid';

export type Role = 'top' | 'jungle' | 'mid' | 'bot' | 'sup'

export type ResourceScore = 1 | 2 | 3 | 4 | 5

export const resourceScores: ResourceScore[] = [1, 2, 3, 4, 5]

export const roles: Role[] = [
  'top', 'jungle', 'mid', 'bot', 'sup'
]

export type Champion = {
  id: string,
  name: string,
  role: Role | null,
  resourceScore: ResourceScore,
  selected: boolean
}

export type Player = {
  id: string,
  name: string,
  championList: Champion[],
  selected: boolean
}

export type PlayerStoreState = {
  playerList: Player[],
  editPlayer: ({ action, playerId, data }: { action: 'add' | 'delete' | 'update', playerId?: string | undefined, data?: Partial<Player> }) => Player[],
  editChampion: ({ action, playerId, selectedChampId, data }: { action: 'add' | 'delete' | 'update', playerId: string | undefined, selectedChampId?: string | undefined, data?: Partial<Champion> }) => void
}

export const usePlayerStore = create(persist<PlayerStoreState>((set, get) => {
  return ({
    playerList: [],
    editPlayer: ({ action, playerId, data }) => {

      switch (action) {
        case 'add': {
          const state = get();

          const newPlayer: Player = { id: uuid(), name: '', championList: [], selected: true };

          const newState = { ...state, playerList: [...state.playerList.map((player) => ({ ...player, selected: false })), newPlayer] }

          set(newState)

          return get().playerList
        }

        case 'update': {
          const state = get()

          const selectedPlayer = state.playerList.find((player) => player.id === playerId)

          if (selectedPlayer === undefined) return get().playerList

          const newState = {
            ...state,
            playerList: state.playerList.map((player) => {
              if (player.id === selectedPlayer.id) {
                return { ...player, ...data, selected: true }
              }
              return { ...player, selected: false }
            })
          }

          set(newState)

          return get().playerList
        }

        case 'delete': {
          const state = get()

          const selectedPlayer = state.playerList.find((player) => player.id === playerId)

          console.log(selectedPlayer)

          if (selectedPlayer === undefined) return get().playerList

          const newState = {
            ...state,
            playerList: state.playerList.filter((player) => player.id !== selectedPlayer.id)
          }

          set(newState)

          return get().playerList
        }

        default:
          return get().playerList
      }

    },
    editChampion: ({ action, playerId, data, selectedChampId }) => {
      if (playerId === undefined) return
      switch (action) {
        case "add": {
          const state = get();

          const newChampion: Champion = { id: uuid(), name: '', resourceScore: resourceScores[0], role: null, selected: true }

          const newState = {
            ...state, playerList: state.playerList.map((player) => {
              if (player.id === playerId) {
                return { ...player, championList: [...player.championList.map((champ) => ({ ...champ, selected: false })), newChampion] }
              }
              return { ...player }
            })
          }

          set(newState)

          break;
        }

        case 'update': {
          const state = get()

          const selectedPlayer = state.playerList.find((player) => player.id === playerId)

          if (selectedPlayer === undefined) return

          const selectedChamp = selectedPlayer.championList.find((champ) => champ.id === selectedChampId)

          const newState = {
            ...state,
            playerList: state.playerList.map((player) => {
              if (player.id === playerId) {
                return {
                  ...player,
                  championList: player.championList.map((champ) => {
                    if (champ.id === selectedChamp?.id) {
                      return { ...champ, ...data, selected: true }
                    }
                    return { ...champ, selected: false }
                  })
                }
              }
              return player
            })
          }

          set(newState)

          break;
        }

        case 'delete': {
          const state = get()

          const selectedPlayer = state.playerList.find((player) => player.id === playerId)

          if (selectedPlayer === undefined) return

          const selectedChamp = selectedPlayer.championList.find((champ) => champ.id === selectedChampId)

          const newState = {
            ...state,
            playerList: state.playerList.map((player) => {
              if (player.id === playerId) {
                return {
                  ...player,
                  championList: player.championList.filter((champ) => champ.id !== selectedChamp?.id)
                }
              }
              return player
            })
          }

          set(newState)

          break;
        }


        default:
          break;
      }
    }
  })
}, {
  name: 'Players',
}))
