'use client';

import { AddIcon } from '@/components/ui/addIcon';
import { useDraftStore } from '@/store/draft';
import { useMemo } from 'react';

export default function Drafts() {
  const { drafts, editDraft } = useDraftStore();

  const selectedDraft = useMemo(() => drafts.find((draft) => draft.selected), [drafts]);

  const emptyDraft = useMemo(() => drafts.find((draft) => !draft.name), [drafts]);
  return (
    <div className='rounded-md w-full h-full bg-red-500 p-4 flex flex-col gap-2'>
      <div className='flex flex-row items-center gap-4'>
        <AddIcon
          onClickHandler={() => {
            if (!emptyDraft) {
              editDraft({ action: 'add' });
            }
          }}
        />
        {drafts.map((draft, index) => (
          <div
            key={index}
            className={`p-2 ${
              selectedDraft?.name === draft.name ? 'bg-sky-500' : 'bg-neutral-500'
            } rounded-md h-full text-white`}
            onClick={() => {
              if (emptyDraft !== undefined) return;

              editDraft({ action: 'update', data: { selected: true }, draftName: draft.name });
            }}
          >
            {draft.name ? draft.name : 'New Draft'}
          </div>
        ))}
      </div>
      {selectedDraft && (
        <div className='flex flex-col gap-2'>
          <input
            value={selectedDraft?.name}
            placeholder='Draft Name'
            className='w-[150px] rounded-md p-2'
            onChange={(e) => {
              editDraft({
                action: 'update',
                data: { name: e.target.value ?? '' },
                draftName: selectedDraft.name,
              });
            }}
          />
          <div>
            <div></div>
            <div></div>
            <div></div>
          </div>
        </div>
      )}
    </div>
  );
}
