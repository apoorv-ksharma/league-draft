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

const InitailDraftPlayerList: DraftPlayerConfig[] = roles.map((role) => ({
  name: '',
  role,
  selected: false,
  selectedChamp: undefined
}))

type Draft = {
  name: string,
  playerList: DraftPlayerConfig[],
  selected: boolean
}

type DraftStoreState = {
  drafts: Draft[],
  editDraft: ({ action, draftName, data }: { action: 'add' | 'update' | 'delete', draftName?: string, data?: Partial<Draft> }) => void
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
    }
  }
}, { name: 'Drafts' }))