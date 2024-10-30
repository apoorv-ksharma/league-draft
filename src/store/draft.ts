import { create } from "zustand"
import { Champion, Role, roles } from "./player"
import { persist } from "zustand/middleware"
import { v4 as uuid } from 'uuid';

export type DraftPlayerConfig = {
  id: string,
  name: string,
  role: Role,
  selectedChamp: Champion | undefined,
  selected: boolean
}

export const InitialDraftPlayer = {
  id: uuid(),
  name: '',
  selected: false,
  selectedChamp: undefined
}

const InitailDraftPlayerList: DraftPlayerConfig[] = roles.map((role) => ({
  ...InitialDraftPlayer,
  role,
}))

type Draft = {
  id: string,
  name: string,
  playerList: DraftPlayerConfig[],
  selected: boolean
}

type DraftStoreState = {
  drafts: Draft[],
  editDraft: ({ action, draftId, data }: { action: 'add' | 'update' | 'delete', draftId?: string, data?: Partial<Draft> }) => void,
  editPlayer: ({ action, draftId, playerName, data }: { action: 'add' | 'update' | 'delete', draftId: string, playerName?: string, data?: Partial<DraftPlayerConfig> }) => void
}

export const useDraftStore = create(persist<DraftStoreState>((set, get) => {
  return {
    drafts: [],
    editDraft: ({ action, draftId, data }) => {
      switch (action) {
        case "add": {
          const state = get();

          const emptyDraft = state.drafts.find((draft) => !draft.name)

          if (emptyDraft) return

          const copy = JSON.parse(JSON.stringify(InitailDraftPlayerList))

          const newDraft: Draft = {
            id: uuid(),
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

          const selectedDraft = state.drafts.find((draft) => draft.id === draftId)

          if (!selectedDraft) return

          const newState: DraftStoreState = {
            ...state, drafts: [...state.drafts.map((draft) => {
              if (draft.id === selectedDraft.id) {
                return { ...draft, ...data, selected: true }
              }
              return { ...draft, selected: false }
            })]
          }

          set(newState)

          break;
        }

        case "delete": {
          const state = get();

          const selectedDraft = state.drafts.find((draft) => draft.id === draftId)

          if (!selectedDraft) return

          const newState: DraftStoreState = {
            ...state, drafts: state.drafts.filter((draft) => draft.id !== selectedDraft.id)
          }

          set(newState)

          break;
        }

        default:
          break;
      }
    },
    editPlayer: ({ action, draftId, data }) => {
      switch (action) {
        case "update": {
          console.log(action, draftId, data)
          if (!data) return
          const state = get()

          const selectedDraft = state.drafts.find((draft) => draft.id === draftId)

          if (selectedDraft === undefined || !data.role) return

          const selectedPlayer = selectedDraft.playerList.find((player) => player.role === data.role)

          const newState = {
            ...state, drafts: state.drafts.map((draft) => {
              if (draft.id === selectedDraft.id) {
                return {
                  ...draft, playerList: draft.playerList.map((player) => {
                    if (player.role === selectedPlayer?.role) {
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