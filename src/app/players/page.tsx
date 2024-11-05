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
import { BASE_URL } from '@/data';
import { Player, resourceScores, roles, usePlayerStore } from '@/store/player';
import axios from 'axios';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function Players() {
  const { playerList, editChampion, editPlayer } = usePlayerStore();
  const [newPlayer, setNewPlayer] = useState({ name: '', inGameName: '', tag: '' });
  const [playerId, setPlayerId] = useState('');
  const [availablePlayers, setAvailablePlayers] = useState<{ name: string; id: string }[]>([]);
  const [loading, setLoading] = useState({ getPlayer: false });
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

  const getPlayer = useCallback(
    async ({ name, inGameName, tag }: { name: string; inGameName: string; tag: string }) => {
      setLoading((prev) => ({ ...prev, getPlayer: true }));

      const response = await axios.get(`${BASE_URL}/player/initPlayer`, {
        params: { name, ign: `${inGameName}#${tag}` },
      });

      if (!selectedPlayer || !selectedPlayer.id) return;

      editPlayer({
        action: 'update',
        data: { name: response.data.name ?? '', id: response.data.id ?? selectedPlayer.id },
        playerId: selectedPlayer?.id,
      });

      response.data.champions.forEach((champion: { name: string; id: string; img: string }) => {
        editChampion({
          action: 'add',
          playerId: response.data.id ?? selectedPlayer.id,
          selectedChampId: champion.id,
          champData: {
            name: champion.name,
            id: champion.id,
            img: champion.img,
            data: roles.reduce((object, role) => {
              object[role] = 0;
              return object;
            }, Object.create({})),
            selected: false,
          },
        });
      });
      setLoading((prev) => ({ ...prev, getPlayer: false }));
    },
    [editChampion, editPlayer, selectedPlayer]
  );

  const getPlayerById = useCallback(
    async ({ playerName, playerId }: { playerName: string; playerId: string }) => {
      setLoading((prev) => ({ ...prev, getPlayer: true }));
      const response = await axios.get(`${BASE_URL}/player/${playerId}/champion`);

      if (!selectedPlayer || !selectedPlayer.id) return;

      editPlayer({
        action: 'update',
        data: { name: playerName ?? '', id: playerId },
        playerId: selectedPlayer?.id,
      });

      response.data.forEach((champion: { name: string; id: string; img: string }) => {
        editChampion({
          action: 'add',
          playerId,
          selectedChampId: champion.id,
          champData: {
            name: champion.name,
            id: champion.id,
            img: champion.img,
            data: roles.reduce((object, role) => {
              object[role] = 0;
              return object;
            }, Object.create({})),
            selected: false,
          },
        });
      });
      setLoading((prev) => ({ ...prev, getPlayer: false }));
    },
    [editChampion, editPlayer, selectedPlayer]
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

  useEffect(() => {
    (async () => {
      const response = await axios.get(`${BASE_URL}/player/`);
      setAvailablePlayers(response.data);
    })();
  }, []);

  return (
    <div className='rounded-md w-full h-full bg-white p-4 flex flex-col gap-2'>
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
          {selectedPlayer.name ? null : (
            <div className='flex flex-row justify-center items-center'>
              <div className='flex flex-col gap-4 w-full'>
                <input
                  value={newPlayer?.name}
                  placeholder='Player Name'
                  className='w-[150px] rounded-md p-2'
                  onChange={(e) => {
                    setNewPlayer((prev) => ({ ...prev, name: e.target.value ?? '' }));
                  }}
                />
                <div className='flex flex-row gap-4'>
                  <input
                    value={newPlayer?.inGameName}
                    placeholder='In Game Name'
                    className='w-[150px] rounded-md p-2'
                    onChange={(e) => {
                      setNewPlayer((prev) => ({ ...prev, inGameName: e.target.value ?? '' }));
                    }}
                  />
                  <div className='flex flex-row justify-center items-center gap-4'>
                    <p className='font-semibold'>#</p>
                    <input
                      value={newPlayer?.tag}
                      placeholder='Tag'
                      className='w-[150px] rounded-md p-2'
                      onChange={(e) => {
                        setNewPlayer((prev) => ({ ...prev, tag: e.target.value ?? '' }));
                      }}
                    />
                  </div>

                  <button
                    disabled={loading.getPlayer}
                    className='p-2 rounded-md bg-slate-500 shadow-xl text-white'
                    onClick={() => {
                      if (newPlayer.name && newPlayer.inGameName && newPlayer.tag)
                        getPlayer({
                          inGameName: newPlayer.inGameName,
                          name: newPlayer.name,
                          tag: newPlayer.tag,
                        });
                    }}
                  >
                    {loading.getPlayer ? 'loading...' : 'Get Player'}
                  </button>
                </div>
              </div>
              <div className='p-10'>OR</div>
              <div className='flex flex-row gap-4 w-full'>
                <div className='bg-white rounded-md'>
                  <Select
                    value={playerId}
                    onValueChange={(id) => {
                      setPlayerId(id);
                    }}
                  >
                    <SelectTrigger className='w-[180px]'>
                      <SelectValue placeholder='Select a player' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Players</SelectLabel>
                        {availablePlayers
                          .filter((player: { id: string }) => {
                            const idList = playerList.map((playerL) => playerL.id);
                            console.log(idList, player);
                            return !idList.includes(player.id);
                          })
                          .map((playerFromList: { id: string; name: string }, index) => (
                            <SelectItem key={index} value={playerFromList.id}>
                              {playerFromList.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <button
                  disabled={loading.getPlayer}
                  className='p-2 rounded-md bg-slate-500 shadow-xl text-white'
                  onClick={() => {
                    if (playerId)
                      getPlayerById({
                        playerName:
                          availablePlayers.find((player) => player.id === playerId)?.name ?? '',
                        playerId: playerId,
                      });
                    setPlayerId('');
                  }}
                >
                  {loading.getPlayer ? 'loading...' : 'Get Player'}
                </button>
              </div>
            </div>
          )}
          <div className='flex flex-row gap-4 items-center'>
            <AddIcon
              onClickHandler={() => {
                const emptyChampion = selectedPlayer.championList.find(
                  (champ) => champ.name === ''
                );
                if (emptyChampion !== undefined) {
                  return;
                }
                editChampion({ action: 'add', playerId: selectedPlayer?.id });
              }}
            />
            {selectedPlayer?.championList.map((champion, index) => {
              return (
                <div key={index} className='flex flex-col justify-center items-center'>
                  <Image
                    className={`rounded-full border-white ${
                      selectedChamp?.id === champion.id ? 'border-red-500' : 'border-white'
                    } border-4 ${
                      selectedChamp?.id === champion.id ? 'w-[75px] h-[75px]' : 'w-[50px] h-[50px]'
                    }`}
                    alt='Champ'
                    src={`/images/${champion.img}`}
                    width={500}
                    height={500}
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
                  {/* <p className='text-ellipsis'>{champion.name}</p> */}
                </div>
              );
            })}
          </div>
          {selectedChamp && (
            <div className='flex flex-col gap-4'>
              <div className='flex flex-col gap-2'>
                {roles.map((role, index) => (
                  <div key={index} className='flex flex-row gap-4'>
                    <p
                      className={`${
                        selectedChamp.data[role] > 0 ? 'bg-fuchsia-500' : 'bg-stone-500'
                      } p-2 rounded-md w-20`}
                      onClick={() => {
                        editChampion({
                          action: 'update',
                          playerId: selectedPlayer.id,
                          selectedChampId: selectedChamp.id,
                          data: { role, resourceScore: 0 },
                        });
                      }}
                    >
                      {role}
                    </p>
                    <div className='flex flex-row gap-2'>
                      {resourceScores.map((resourceScore, index) => {
                        return (
                          <div
                            className={`${(() => {
                              switch (resourceScore) {
                                case 0:
                                  return 'bg-black';
                                case 1:
                                  return 'bg-green-700';
                                case 2:
                                  return 'bg-green-300';
                                case 3:
                                  return 'bg-yellow-500';
                                case 4:
                                  return 'bg-red-400';
                                case 5:
                                  return 'bg-red-600';

                                default:
                                  break;
                              }
                            })()} ${
                              resourceScore === selectedChamp.data[role]
                                ? 'border-black'
                                : 'border-white'
                            } border-4 p-2 rounded-full w-8 h-8`}
                            key={index}
                            onClick={() => {
                              editChampion({
                                action: 'update',
                                playerId: selectedPlayer.id,
                                selectedChampId: selectedChamp.id,
                                data: { role, resourceScore },
                              });
                            }}
                          ></div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
