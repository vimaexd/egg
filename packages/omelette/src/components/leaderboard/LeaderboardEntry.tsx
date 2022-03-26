import React from 'react';
import Image from 'next/image';

interface LeaderboardEntryProps {
  entry: any;
  index: number;
}

export default function LeaderboardEntry(props: LeaderboardEntryProps) {
  return (
    <div className='flex flex-row items-center space-x-4 bg-str-bleck-200 p-4 my-2 rounded-md'>
      <div className='w-8 h-8 bg-exyl-red flex items-center justify-center rounded-full'>
        <p className='font-semibold text-xs'>{props.index + 1}</p>
      </div>
      <div className='mx-2 flex flex-col justify-center'>
        <Image src={props.entry.user.avatar} width={64} height={64} className="rounded-full" alt="Profile picture" layout='fixed'/>
      </div>
      <div>
        <h2 className='font-medium text-xl'>
          <span className="font-bold">{props.entry.user.name.split("#")[0]}</span>
          <span className="font-normal text-xs ">#{props.entry.user.name.split("#")[1]}</span>
        </h2>
        <p>{props.entry.count} battle{(props.entry.count > 1) ? 's' : ''} won</p>
      </div>
    </div>
  )
}
