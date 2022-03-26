import React from 'react';
import Image from 'next/image'

import SidebarGroup from './SidebarGroup'
import SidebarOption from './SidebarOption'

import ExylLogoTransparent from '../../assets/exyl_logo_transparent.png'
import Link from 'next/link';

export default function Sidebar() {
  return (
    <div className='sticky top-0 h-screen w-72 bg-str-bleck-200 flex items-center flex-col z-20 flex-shrink-0'>
      <div className='flex items-center justify-center p-2'>
          <Link href="/flutegang" passHref>
            <Image src={ExylLogoTransparent} width={92} height={92} alt="Exyl logo"></Image>
          </Link>
      </div>
      <div className="h-full w-full">
        {/* <h1 className="font-black italic text-5xl p-4 text-center">EGGBOT</h1> */}

        <SidebarGroup name="Ratio Battles">
          <SidebarOption icon="bx bx-sm bx-timer" href="/flutegang/ratio/cooldown" text="Cooldown"></SidebarOption>
          <SidebarOption icon="bx bx-sm bx-medal" href="/flutegang/ratio/leaderboard" text="Leaderboard"></SidebarOption>
        </SidebarGroup>

        {/* <SidebarGroup name="Reaction Words">
          <SidebarOption icon="bx bx-sm bx-text" href="/flutegang/react/words" text="Words"></SidebarOption>
        </SidebarGroup> */}
      </div>
      <div className='p-4'>
        <p>made with 💜 by mae</p>
      </div>
    </div>
  )
}
