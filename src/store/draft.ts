// draft
// draft - name, draftPlayerList-- name, role, selected champ, length ===5

import { create } from "zustand"
import { Champion, Role, roles } from "./player"
import { persist } from "zustand/middleware"

export type DraftPlayerConfig = {
  name: string,
  role: Role,
  selectedChamp: Champion | undefined,
  selected: boolean
}

export const InitialDraftPlayer = {
  name: '',
  selected: false,
  selectedChamp: undefined
}

const InitailDraftPlayerList: DraftPlayerConfig[] = roles.map((role) => ({
  ...InitialDraftPlayer,
  role,
}))

type Draft = {
  name: string,
  playerList: DraftPlayerConfig[],
  selected: boolean
}

type DraftStoreState = {
  drafts: Draft[],
  editDraft: ({ action, draftName, data }: { action: 'add' | 'update' | 'delete', draftName?: string, data?: Partial<Draft> }) => void,
  editPlayer: ({ action, draftName, playerName, data }: { action: 'add' | 'update' | 'delete', draftName: string, playerName?: string, data?: Partial<DraftPlayerConfig> }) => void
}

export const useDraftStore = create(persist<DraftStoreState>((set, get) => {
  return {
    drafts: [],
    editDraft: ({ action, draftName, data }) => {
      switch (action) {
        case "add": {
          const state = get();

          const emptyDraft = state.drafts.find((draft) => !draft.name)

          if (emptyDraft) return

          const copy = JSON.parse(JSON.stringify(InitailDraftPlayerList))

          const newDraft: Draft = {
            name: '',
            playerList: copy,
            selected: true
          }

          const newState: DraftStoreState = { ...state, drafts: [...state.drafts.map((draft) => ({ ...draft, selected: false })), newDraft] }

          set(newState)
          break;
        }

        case "update": {
          const state = get();

          const selectedDraft = state.drafts.find((draft) => draft.name === draftName)
          if (!selectedDraft) return

          const newState: DraftStoreState = {
            ...state, drafts: [...state.drafts.map((draft) => {
              if (draft.name === selectedDraft.name) {
                return { ...draft, ...data, selected: true }
              }
              return { ...draft, selected: false }
            })]
          }

          set(newState)

          break;
        }

        default:
          break;
      }
    },
    editPlayer: ({ action, draftName, data }) => {
      switch (action) {
        case "update": {
          console.log(action, draftName, data)
          if (!data) return
          const state = get()
          const selectedDraft = state.drafts.find((draft) => draft.name === draftName)

          if (selectedDraft === undefined || !data.role) return

          const selectedPlayer = selectedDraft.playerList.find((player) => player.role === data.role)
          console.log(selectedPlayer)

          const newState = {
            ...state, drafts: state.drafts.map((draft) => {
              if (draft.name === selectedDraft.name) {
                return {
                  ...draft, playerList: draft.playerList.map((player) => {
                    if (player.role === selectedPlayer?.role) {
                      console.log(player, selectedPlayer)
                      return { ...player, ...data }
                    }
                    return player
                  })
                }
              }
              return draft
            })
          }

          set(newState)

          break;

        }


        default:
          break;
      }
    }
  }
}, { name: 'Drafts' }))