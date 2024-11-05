import { create } from "zustand"
import { persist } from "zustand/middleware";
import { v4 as uuid } from 'uuid';

export type Role = 'top' | 'jungle' | 'mid' | 'bot' | 'sup'

export type ResourceScore = 0 | 1 | 2 | 3 | 4 | 5

export const getResourceColour = ({ resourceScore }: { resourceScore: ResourceScore }) => {
  switch (resourceScore) {
    case 0: return 'black'
    case 1: return 'green-700'
    case 2: return 'green-300'
    case 3: return 'yellow-500'
    case 4: return 'red-300'
    case 5: return 'red-700'

    default:
      break;
  }
}

export const resourceScores: ResourceScore[] = [1, 2, 3, 4, 5]

export const roles: Role[] = [
  'top', 'jungle', 'mid', 'bot', 'sup'
]

export type Champion = {
  id: string,
  name: string,
  img: string,
  data: { [R in Role]: ResourceScore },
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
  editChampion: ({ action, playerId, selectedChampId, data, champData }: { action: 'add' | 'delete' | 'update', playerId: string | undefined, selectedChampId?: string | undefined, data?: { role?: Role, resourceScore?: ResourceScore, selected?: boolean }, champData?: Champion }) => void
}

export const usePlayerStore = create(persist<PlayerStoreState>((set, get) => {
  return ({
    playerList: [],
    editPlayer: ({ action, playerId, data }) => {
      switch (action) {
        case 'add': {
          const state = get();

          const newPlayer: Player = { id: playerId ?? uuid(), name: '', championList: [], selected: true };

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
    editChampion: ({ action, playerId, data, selectedChampId, champData }) => {
      if (playerId === undefined) return
      switch (action) {
        case "add": {
          const state = get();
          let newChampion: Champion
          if (champData) { newChampion = champData }
          else newChampion = { id: uuid(), name: '', img: '', data: roles.reduce((object, role) => { object[role] = 0; return object }, Object.create({})), selected: true }

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
                      if (data?.role && data?.resourceScore !== undefined)
                        champ.data[data?.role] = data?.resourceScore
                      return { ...champ, selected: true }
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
