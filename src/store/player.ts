import { create } from "zustand"
import { persist } from "zustand/middleware";

export type Role = 'top' | 'jungle' | 'mid' | 'bot' | 'sup'

export type ResourceScore = 1 | 2 | 3 | 4 | 5

export const resourceScores: ResourceScore[] = [1, 2, 3, 4, 5]

export const roles: Role[] = [
  'top', 'jungle', 'mid', 'bot', 'sup'
]

export type Champion = {
  name: string,
  role: Role | null,
  resourceScore: ResourceScore,
  selected: boolean
}

export type Player = {
  name: string;
  championList: Champion[],
  selected: boolean
}

export type PlayerStoreState = {
  playerList: Player[],
  editPlayer: ({ action, playerName, data }: { action: 'add' | 'delete' | 'update', playerName?: string | undefined, data?: Partial<Player> }) => Player[],
  editChampion: ({ action, playerName, selectedChampName, data }: { action: 'add' | 'delete' | 'update', playerName: string | undefined, selectedChampName?: string | undefined, data?: Partial<Champion> }) => void
}

export const usePlayerStore = create(persist<PlayerStoreState>((set, get) => {
  return ({
    playerList: [],
    editPlayer: ({ action, playerName, data }) => {

      switch (action) {
        case 'add': {
          const newPlayer: Player = { name: '', championList: [], selected: true };
          const state = get()

          const newState = { ...state, playerList: [...state.playerList.map((player) => ({ ...player, selected: false })), newPlayer] }

          set(newState)

          return get().playerList
        }

        case 'update': {
          const state = get()

          const selectedPlayer = state.playerList.find((player) => player.name === playerName)

          if (selectedPlayer === undefined) return get().playerList

          const newState = {
            ...state, playerList: state.playerList.map((player) => {
              if (player.name === selectedPlayer.name) {
                return { ...player, ...data, selected: true }
              }
              return { ...player, selected: false }
            })
          }

          set(newState)

          return get().playerList
        }

        default:
          return get().playerList
      }

    },
    editChampion: ({ action, playerName, data, selectedChampName }) => {
      if (playerName === undefined) return
      switch (action) {
        case "add": {
          const newChampion: Champion = { name: '', resourceScore: resourceScores[0], role: null, selected: true }
          set((state) => ({
            ...state, playerList: state.playerList.map((player) => {
              if (player.name === playerName) {
                return { ...player, championList: [...player.championList.map((champ) => ({ ...champ, selected: false })), newChampion] }
              }
              return { ...player }
            })
          }))

          break;
        }

        case 'update': {
          const state = get()

          const selectedPlayer = state.playerList.find((player) => player.name === playerName)
          if (selectedPlayer === undefined) return

          const selectedChamp = selectedPlayer.championList.find((champ) => champ.name === selectedChampName)
          set((state) => ({
            ...state, playerList: state.playerList.map((player) => {
              if (player.name === playerName) {
                return {
                  ...player, championList: player.championList.map((champ) => {
                    if (champ.name === selectedChamp?.name) {
                      return { ...champ, ...data, selected: true }
                    }
                    return { ...champ, selected: false }
                  })
                }
              }
              return player
            })
          }))

          break;
          return
        }


        default:
          break;
      }
    }
  })
}, {
  name: 'Players',
}))
