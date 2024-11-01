'use client';

import { AddIcon } from '@/components/ui/addIcon';
import { DeleteIcon } from '@/components/ui/deleteIcon';
import { Player, resourceScores, roles, usePlayerStore } from '@/store/player';
import Image from 'next/image';
import { useEffect, useMemo } from 'react';
import Aatrox from '../../tiles/Aatrox_0.jpg';

export default function Players() {
  const { playerList, editChampion, editPlayer } = usePlayerStore();
  const selectedPlayer = useMemo(() => playerList.find((player) => player.selected), [playerList]);
  const selectedChamp = useMemo(
    () => selectedPlayer?.championList.find((champ) => champ?.selected),
    [selectedPlayer?.championList]
  );
  const emptyPlayer = useMemo(
    () => playerList.find((player: Player) => player.name === ''),
    [playerList]
  );
  const emptyChampion = useMemo(
    () => selectedPlayer?.championList.find((champ) => champ.name === ''),
    [selectedPlayer?.championList]
  );

  useEffect(() => {
    if (emptyPlayer && !emptyPlayer.selected) {
      editPlayer({ action: 'update', data: { selected: true }, playerId: emptyPlayer.id });
    }
    if (selectedPlayer && emptyChampion && !emptyChampion.selected) {
      editChampion({
        action: 'update',
        data: { selected: true },
        playerId: selectedPlayer?.id,
        selectedChampId: emptyChampion.id,
      });
    }
  }, [
    editChampion,
    editPlayer,
    emptyChampion,
    emptyPlayer,
    playerList,
    selectedChamp,
    selectedPlayer,
  ]);

  return (
    <div className='rounded-md w-full h-full bg-yellow-500 p-4 flex flex-col gap-2'>
      <div className='flex flex-row items-center gap-4'>
        <AddIcon
          onClickHandler={() => {
            if (!emptyPlayer) {
              editPlayer({ action: 'add' });
            }
          }}
        />
        {playerList.map((player, index) => (
          <div
            key={index}
            className={`p-2 ${
              selectedPlayer?.name === player.name ? 'bg-sky-500' : 'bg-neutral-500'
            } rounded-md h-full text-white`}
            onClick={() => {
              if (emptyPlayer !== undefined) return;

              editPlayer({ action: 'update', data: { selected: true }, playerId: player.id });
            }}
          >
            {player.name ? player.name : 'New Player'}
          </div>
        ))}
      </div>
      {selectedPlayer && (
        <div className='flex flex-col gap-2'>
          <div className='flex flex-row gap-4'>
            <input
              value={selectedPlayer?.name}
              placeholder='Player Name'
              className='w-[150px] rounded-md p-2'
              onChange={(e) => {
                editPlayer({
                  action: 'update',
                  data: { name: e.target.value ?? '' },
                  playerId: selectedPlayer.id,
                });
              }}
            />
            <DeleteIcon
              onClickHandler={() => {
                editPlayer({
                  action: 'delete',
                  playerId: selectedPlayer.id,
                });
              }}
            />
          </div>
          <div className='flex flex-row gap-4'>
            <AddIcon
              onClickHandler={() => {
                const emptyChampion = selectedPlayer.championList.find(
                  (champ) => champ.name === ''
                );
                console.log(emptyChampion);
                if (emptyChampion !== undefined) {
                  return;
                }
                editChampion({ action: 'add', playerId: selectedPlayer?.id });
              }}
            />
            {selectedPlayer?.championList.map((champion, index) => {
              return (
                <Image
                  key={index}
                  className='rounded-full'
                  alt='Champ'
                  src={Aatrox}
                  width={50}
                  height={50}
                  onClick={() => {
                    if (emptyChampion !== undefined) return;
                    editChampion({
                      action: 'update',
                      playerId: selectedPlayer.id,
                      data: { selected: true },
                      selectedChampId: champion.id,
                    });
                  }}
                />
              );
            })}
          </div>
          {selectedChamp && (
            <div className='flex flex-col gap-4'>
              <div className='flex flex-row gap-4'>
                <input
                  value={selectedChamp.name}
                  placeholder='Champ Name'
                  className='w-[150px] rounded-md p-2'
                  onChange={(e) => {
                    editChampion({
                      action: 'update',
                      playerId: selectedPlayer.id,
                      selectedChampId: selectedChamp.id,
                      data: { name: e.target.value ?? '' },
                    });
                  }}
                />
                <DeleteIcon
                  onClickHandler={() => {
                    editChampion({
                      action: 'delete',
                      playerId: selectedPlayer.id,
                      selectedChampId: selectedChamp.id,
                    });
                  }}
                />
              </div>
              <div className='flex flex-row gap-2'>
                {roles.map((role, index) => (
                  <p
                    className={`${
                      role === selectedChamp.role ? 'bg-fuchsia-500' : 'bg-stone-500'
                    } p-2 rounded-md`}
                    key={index}
                    onClick={() => {
                      editChampion({
                        action: 'update',
                        playerId: selectedPlayer.id,
                        selectedChampId: selectedChamp.id,
                        data: { role },
                      });
                    }}
                  >
                    {role}
                  </p>
                ))}
              </div>
              <div className='flex flex-row gap-2'>
                {resourceScores.map((resourceScore, index) => (
                  <p
                    className={`${
                      resourceScore === selectedChamp.resourceScore
                        ? 'bg-fuchsia-500'
                        : 'bg-stone-500'
                    } p-2 rounded-md`}
                    key={index}
                    onClick={() => {
                      editChampion({
                        action: 'update',
                        playerId: selectedPlayer.id,
                        selectedChampId: selectedChamp.id,
                        data: { resourceScore },
                      });
                    }}
                  >
                    {resourceScore}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
