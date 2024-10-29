'use client';

import { AddIcon } from '@/components/ui/addIcon';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InitialDraftPlayer, useDraftStore } from '@/store/draft';
import { Role, usePlayerStore } from '@/store/player';
import { useEffect, useMemo } from 'react';

export default function Drafts() {
  const { drafts, editDraft, editPlayer } = useDraftStore();
  const { playerList } = usePlayerStore();

  const selectedDraft = useMemo(() => drafts.find((draft) => draft.selected), [drafts]);

  const selectedPlayers = selectedDraft?.playerList.map((player) => player.name);

  const emptyDraft = useMemo(() => drafts.find((draft) => !draft.name), [drafts]);

  useEffect(() => {
    console.log(selectedDraft);
  }, [selectedDraft]);

  return (
    <div className='rounded-md w-full h-full bg-pink-800 p-4 flex flex-col gap-2'>
      <div className='flex flex-row items-center gap-4'>
        <AddIcon
          onClickHandler={() => {
            if (!emptyDraft) {
              editDraft({ action: 'add' });
            }
          }}
        />
        {drafts.map((draft, index) => (
          <div key={index} className=''>
            <div
              className={`p-2 ${
                selectedDraft?.name === draft.name ? 'bg-slate-500' : 'bg-neutral-500'
              } rounded-md h-full text-white`}
              onClick={() => {
                if (emptyDraft !== undefined) return;

                editDraft({ action: 'update', data: { selected: true }, draftName: draft.name });
              }}
            >
              {draft.name ? draft.name : 'New Draft'} -{' '}
              {draft.playerList.reduce((totalScore, player) => {
                return (totalScore += player.selectedChamp?.resourceScore ?? 0);
              }, 0)}
            </div>
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
          <div className='flex flex-col gap-4 justify-between'>
            {selectedDraft.playerList.map((player, index) => (
              <div key={index} className='flex flex-row gap-4 p-4 bg-sky-500'>
                <div className='bg-white rounded-md'>
                  {player.name ? (
                    <div
                      className='p-2 bg-slate-500 rounded-md w-[180px]'
                      onClick={() => {
                        editPlayer({
                          action: 'update',
                          draftName: selectedDraft.name,
                          data: { role: player.role, ...InitialDraftPlayer },
                        });
                      }}
                    >
                      {player.name}
                    </div>
                  ) : (
                    <Select
                      value={player.name}
                      onValueChange={(name) => {
                        editPlayer({
                          action: 'update',
                          draftName: selectedDraft.name,
                          data: { role: player.role, name },
                        });
                      }}
                    >
                      <SelectTrigger className='w-[180px]'>
                        <SelectValue placeholder='Select a player' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Players</SelectLabel>
                          {playerList
                            .filter(
                              (player) =>
                                !selectedPlayers?.includes(player.name) &&
                                player.championList.reduce((roles: Role[], champ) => {
                                  if (champ.role) roles.push(champ.role);

                                  return roles;
                                }, [])
                            )
                            .map((playerFromList, index) => (
                              <SelectItem key={index} value={playerFromList.name}>
                                {playerFromList.name}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  )}
                </div>
                <div className='w-full gap-4 flex flex-row justify-center items-center'>
                  {player.selectedChamp ? (
                    <div
                      key={index}
                      className='bg-red-500 rounded-md p-2'
                      onClick={() => {
                        editPlayer({
                          action: 'update',
                          draftName: selectedDraft.name,
                          data: { selectedChamp: undefined, role: player.role },
                        });
                      }}
                    >
                      {player.selectedChamp.name}
                    </div>
                  ) : (
                    playerList
                      .find((playerL) => playerL.name === player.name)
                      ?.championList.filter((champ) => champ.role === player.role)
                      .map((champion, index) => (
                        <div
                          key={index}
                          className='bg-red-200 rounded-md p-2'
                          onClick={() => {
                            editPlayer({
                              action: 'update',
                              draftName: selectedDraft.name,
                              data: { selectedChamp: champion, role: player.role },
                            });
                          }}
                        >
                          {champion.name}
                        </div>
                      ))
                  )}
                </div>
                <div className='bg-yellow-500 p-2 rounded-md'>
                  {player.selectedChamp?.resourceScore ?? 0}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
