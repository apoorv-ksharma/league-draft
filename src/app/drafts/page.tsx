'use client';

import { AddIcon } from '@/components/ui/addIcon';
import { DeleteIcon } from '@/components/ui/deleteIcon';
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
import { Player, Role, roles, usePlayerStore } from '@/store/player';
import Image from 'next/image';
import { useCallback, useMemo } from 'react';

export default function Drafts() {
  const { drafts, editDraft, editPlayer } = useDraftStore();
  const { playerList } = usePlayerStore();

  const selectedDraft = useMemo(() => drafts.find((draft) => draft.selected), [drafts]);

  const selectedPlayers = selectedDraft?.playerList.map((player) => player.name);

  const emptyDraft = useMemo(() => drafts.find((draft) => !draft.name), [drafts]);

  const players = useMemo(() => {
    const playerMap = new Map<Role, Player[]>();

    roles.forEach((role) => {
      const list = playerList.filter((playerL) => {
        // if (!playerL.name) return false;
        const playerRoles = playerL.championList.reduce((champRoles: Role[], champ) => {
          if (champ.data[role] > 0 && !champRoles.includes(role)) champRoles.push(role);

          return champRoles;
        }, []);

        const doesPlayerHaveRole = playerRoles.includes(role);

        return doesPlayerHaveRole;
      });
      playerMap.set(role, list);
    });

    return playerMap;
  }, [playerList]);

  const availablePlayerList = useCallback(
    ({ playerRole }: { playerRole: Role }) => {
      return players.get(playerRole)?.filter((player) => !selectedPlayers?.includes(player.name));
    },
    [players, selectedPlayers]
  );

  return (
    <div className='rounded-md w-full h-full bg-slate-400 p-1 md:p-4 flex flex-col gap-2'>
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
                selectedDraft?.name === draft.name ? 'bg-blue-500' : 'bg-neutral-500'
              } rounded-md h-full text-white`}
              onClick={() => {
                if (emptyDraft !== undefined) return;

                editDraft({ action: 'update', data: { selected: true }, draftId: draft.id });
              }}
            >
              {draft.name ? draft.name : 'New Draft'}
            </div>
          </div>
        ))}
      </div>
      {selectedDraft && (
        <div className='flex flex-col gap-2'>
          <div className='flex flex-row gap-4'>
            <input
              value={selectedDraft?.name}
              placeholder='Draft Name'
              className='w-[150px] rounded-md p-2'
              onChange={(e) => {
                editDraft({
                  action: 'update',
                  data: { name: e.target.value ?? '' },
                  draftId: selectedDraft.id,
                });
              }}
            />
            <DeleteIcon
              onClickHandler={() => {
                editDraft({
                  action: 'delete',
                  draftId: selectedDraft.id,
                });
              }}
            />
          </div>
          <div className='flex flex-col gap-4 justify-between'>
            {selectedDraft.playerList.map((player, index) => (
              <div key={index} className='flex flex-row gap-4 md:p-4'>
                <div className='rounded-md h-[75px] flex justify-center items-center'>
                  {player.name ? (
                    <div
                      className='md:p-2 rounded-md bg-blue-500 h-full w-[50px] md:w-[180px] flex justify-center items-center'
                      onClick={() => {
                        editPlayer({
                          action: 'update',
                          draftId: selectedDraft.id,
                          data: { role: player.role, ...InitialDraftPlayer },
                        });
                      }}
                    >
                      <p className='text-center text-white hidden md:block'>{player.name}</p>
                      <p className='text-center text-white block md:hidden'>
                        {player.name.split('')[0]}
                      </p>
                    </div>
                  ) : (
                    <div className='bg-white rounded-md'>
                      <Select
                        value={player.name}
                        onValueChange={(name) => {
                          editPlayer({
                            action: 'update',
                            draftId: selectedDraft.id,
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
                            {availablePlayerList({ playerRole: player.role })?.map(
                              (playerFromList, index) => (
                                <SelectItem key={index} value={playerFromList.name}>
                                  {playerFromList.name}
                                </SelectItem>
                              )
                            )}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className='gap-4 flex flex-row items-center w-full justify-center'>
                  {player.selectedChamp ? (
                    <Image
                      key={index}
                      className={`rounded-full border-red-500 border-4 w-[75px] h-[75px]`}
                      alt='Champ'
                      src={`/images/${player.selectedChamp.img}`}
                      width={100}
                      height={100}
                      onClick={() => {
                        editPlayer({
                          action: 'update',
                          draftId: selectedDraft.id,
                          data: { selectedChamp: undefined, role: player.role },
                        });
                      }}
                    />
                  ) : (
                    <div className='flex flex-row overflow-auto gap-4'>
                      {playerList
                        .find((playerL) => playerL.name === player.name)
                        ?.championList.filter((champ) => champ.data[player.role] > 0)
                        .map((champion, index) => (
                          <Image
                            key={index}
                            onClick={() => {
                              editPlayer({
                                action: 'update',
                                draftId: selectedDraft.id,
                                data: { selectedChamp: champion, role: player.role },
                              });
                            }}
                            className={`rounded-full border-white border-4 w-[75px] h-[75px]`}
                            alt='Champ'
                            src={`/images/${champion.img}`}
                            width={50}
                            height={50}
                          />
                        ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
