'use client';

import { AddIcon } from '@/components/ui/addIcon';
import { Player, resourceScores, roles, usePlayerStore } from '@/store/player';
import { useEffect, useMemo } from 'react';

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
    console.log(playerList, emptyChampion, selectedChamp);
    if (emptyPlayer && !emptyPlayer.selected) {
      editPlayer({ action: 'update', data: { selected: true }, playerName: emptyPlayer.name });
    }
    if (selectedPlayer && emptyChampion && !emptyChampion.selected) {
      editChampion({
        action: 'update',
        data: { selected: true },
        playerName: selectedPlayer?.name,
        selectedChampName: emptyChampion.name,
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

              editPlayer({ action: 'update', data: { selected: true }, playerName: player.name });
            }}
          >
            {player.name ? player.name : 'New Player'}
          </div>
        ))}
      </div>
      {selectedPlayer && (
        <div className='flex flex-col gap-2'>
          <input
            value={selectedPlayer?.name}
            placeholder='Player Name'
            className='w-[150px] rounded-md p-2'
            onChange={(e) => {
              editPlayer({
                action: 'update',
                data: { name: e.target.value ?? '' },
                playerName: selectedPlayer.name,
              });
            }}
          />
          <div className='flex flex-row gap-4'>
            <AddIcon
              onClickHandler={() => {
                const emptyChampion = selectedPlayer.championList.find(
                  (champ) => champ.name === ''
                );
                if (emptyChampion !== undefined) {
                  return;
                }
                editChampion({ action: 'add', playerName: selectedPlayer?.name });
              }}
            />
            {selectedPlayer?.championList.map((champion, index) => {
              return (
                <div
                  key={index}
                  className={`p-2 ${
                    selectedChamp?.name === champion.name ? 'bg-indigo-500' : 'bg-slate-500'
                  } rounded-md h-full text-white`}
                  onClick={() => {
                    if (emptyChampion !== undefined) return;
                    console.log(champion);
                    editChampion({
                      action: 'update',
                      playerName: selectedPlayer.name,
                      data: { selected: true },
                      selectedChampName: champion.name,
                    });
                  }}
                >
                  {champion.name ? champion.name : 'New Champion'}
                </div>
              );
            })}
          </div>
          {selectedChamp && (
            <div className='flex flex-col gap-4'>
              <input
                value={selectedChamp.name}
                placeholder='Champ Name'
                className='w-[150px] rounded-md p-2'
                onChange={(e) => {
                  editChampion({
                    action: 'update',
                    playerName: selectedPlayer.name,
                    selectedChampName: selectedChamp.name,
                    data: { name: e.target.value ?? '' },
                  });
                }}
              />
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
                        playerName: selectedPlayer.name,
                        selectedChampName: selectedChamp.name,
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
                        playerName: selectedPlayer.name,
                        selectedChampName: selectedChamp.name,
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
