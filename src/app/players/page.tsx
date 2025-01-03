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
import { Player, roles, usePlayerStore } from '@/store/player';
import axios from 'axios';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useState } from 'react';

export default function Players() {
  const { playerList, editChampion, editPlayer } = usePlayerStore();
  const [newPlayer, setNewPlayer] = useState({ name: '', inGameName: '', tag: '' });
  const [newChamp, setNewChamp] = useState<{ name: string; id: string; img: string }>();
  const [playerId, setPlayerId] = useState('');
  const [availablePlayers, setAvailablePlayers] = useState<{ name: string; id: string }[]>([]);
  const [availableChampions, setAvailableChampions] = useState<
    { name: string; id: string; img: string }[]
  >([]);
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
      const playerResponse = await axios.get(`${BASE_URL}/player/`);
      setAvailablePlayers(playerResponse.data);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const championResponse = await axios.get(`${BASE_URL}/champion/`);
      setAvailableChampions(championResponse.data);
    })();
  }, []);

  return (
    <div className='rounded-md w-full h-full bg-slate-400 p-2 md:p-4 flex flex-col gap-2'>
      <div className='flex flex-row items-center gap-4'>
        <AddIcon
          onClickHandler={() => {
            if (!emptyPlayer) {
              editPlayer({ action: 'add' });
            }
          }}
        />
        <div className='flex flex-row items-center gap-2 md:gap-4 flex-wrap'>
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
      </div>
      {selectedPlayer && (
        <div className='flex flex-col gap-2'>
          {selectedPlayer.name ? null : (
            <div className='flex md:flex-row flex-col justify-center items-center'>
              <div className='flex flex-col gap-4 w-full'>
                <input
                  value={newPlayer?.name}
                  placeholder='Player Name'
                  className='w-[150px] rounded-md p-2'
                  onChange={(e) => {
                    setNewPlayer((prev) => ({ ...prev, name: e.target.value ?? '' }));
                  }}
                />
                <div className='flex flex-col md:flex-row gap-4'>
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
              <div className='flex flex-col md:flex-row gap-4 w-full'>
                <div className='bg-white rounded-md w-fit'>
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
          {selectedPlayer?.championList.length === 0 ? null : (
            <div className='flex flex-row gap-2 md:gap-4 items-center'>
              {newChamp?.id ? (
                <div className='bg-white rounded-md flex flex-row gap-4'>
                  <Select
                    value={newChamp?.id}
                    onValueChange={(id) => {
                      const champ = availableChampions.find((champion) => champion.id === id);
                      setNewChamp(champ);
                    }}
                  >
                    <SelectTrigger className='w-[180px]'>
                      <SelectValue placeholder='Select a champion' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Champions</SelectLabel>
                        {availableChampions
                          .sort((a, b) => {
                            if (a.name < b.name) {
                              return -1;
                            }
                            if (a.name > b.name) {
                              return 1;
                            }
                            return 0;
                          })
                          .filter((champion: { id: string }) => {
                            const idList = selectedPlayer.championList.map((champ) => champ.id);
                            return !idList.includes(champion.id);
                          })
                          .map((champion: { id: string; name: string }, index) => (
                            <SelectItem key={index} value={champion.id}>
                              {champion.name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <button
                    className='rounded-md p-2 bg-sky-500'
                    disabled={!newChamp}
                    onClick={() => {
                      if (!newChamp) return;
                      editChampion({
                        action: 'add',
                        playerId: selectedPlayer.id,
                        selectedChampId: newChamp.id,
                        champData: {
                          name: newChamp.name,
                          id: newChamp.id,
                          img: newChamp.img,
                          data: roles.reduce((object, role) => {
                            object[role] = 0;
                            return object;
                          }, Object.create({})),
                          selected: false,
                        },
                      });
                      setNewChamp(undefined);
                    }}
                  >
                    Add
                  </button>
                </div>
              ) : (
                <AddIcon
                  onClickHandler={() => {
                    setNewChamp({ id: 'NewId', img: '', name: '' });
                  }}
                />
              )}
              <div className='flex flex-row gap-2 md:gap-4 flex-wrap'>
                {selectedPlayer?.championList
                  // .filter((champ) => champ.name)
                  .map((champion, index) => {
                    return (
                      <Image
                        key={index}
                        className={`rounded-full md:border-white ${
                          selectedChamp?.id === champion.id ? 'border-red-500' : 'border-white'
                        } border-4 w-[50px] h-[50px] ${
                          selectedChamp?.id === champion.id
                            ? 'md:w-[75px] md:h-[75px]'
                            : 'md:w-[50px] md:h-[50px]'
                        }`}
                        alt='Champ'
                        src={`/images/${champion.img}`}
                        width={100}
                        height={100}
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
            </div>
          )}
          {selectedChamp && (
            <div className='flex flex-col gap-4'>
              <div className='flex flex-row gap-2 md:ml-[150px] flex-wrap'>
                {roles.map((role, index) => (
                  <div key={index} className='flex flex-row gap-4'>
                    <p
                      className={`${
                        selectedChamp.data[role] > 0 ? 'bg-fuchsia-500' : 'bg-stone-500'
                      } p-2 rounded-md w-15 md:w-20 cursor-pointer`}
                      onClick={() => {
                        editChampion({
                          action: 'update',
                          playerId: selectedPlayer.id,
                          selectedChampId: selectedChamp.id,
                          data: { role, resourceScore: selectedChamp.data[role] > 0 ? 0 : 1 },
                        });
                      }}
                    >
                      {role}
                    </p>
                  </div>
                ))}
                <div
                  className='md:ml-40 p-2 rounded-md bg-red-500 md:bg-red-200 hover:bg-red-500 cursor-pointer text-white'
                  onClick={() => {
                    editChampion({
                      action: 'delete',
                      playerId: selectedPlayer.id,
                      selectedChampId: selectedChamp.id,
                    });
                  }}
                >
                  Delete
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
