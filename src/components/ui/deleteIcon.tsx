import Image from 'next/image';
import { MouseEventHandler } from 'react';
import trash from '@/icons/trash.png';

export const DeleteIcon = ({
  onClickHandler,
}: {
  onClickHandler: MouseEventHandler<HTMLImageElement>;
}) => {
  return (
    <Image
      src={trash}
      width={50}
      height={50}
      alt='plus-icon'
      className='p-3 w-10 h-10 bg-white rounded-full'
      onClick={onClickHandler}
    />
  );
};
