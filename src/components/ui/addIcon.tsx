import Image from 'next/image';
import { MouseEventHandler } from 'react';
import plusIcon from '@/icons/plus-solid.svg';

export const AddIcon = ({
  onClickHandler,
}: {
  onClickHandler: MouseEventHandler<HTMLImageElement>;
}) => {
  return (
    <Image
      src={plusIcon}
      width={50}
      height={50}
      alt='plus-icon'
      className='p-3 w-10 h-10 bg-blue-500 rounded-full'
      onClick={onClickHandler}
    />
  );
};
