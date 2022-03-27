import React, { Fragment, useState } from 'react';
import Image from 'next/image'

import SidebarGroup from './SidebarGroup'
import SidebarOption from './SidebarOption'

import ExylLogoTransparent from '../../assets/exyl_logo_transparent.png'
import Link from 'next/link';

function SidebarLinks() {
  return (    
    <Fragment>
      <SidebarGroup name="Ratio Battles">
        <SidebarOption icon="bx bx-sm bx-timer" href="/flutegang/ratio/cooldown" text="Cooldown"></SidebarOption>
        <SidebarOption icon="bx bx-sm bx-medal" href="/flutegang/ratio/leaderboard" text="Leaderboard"></SidebarOption>
      </SidebarGroup>
      <SidebarGroup name="Reaction Words">
        <SidebarOption icon="bx bx-sm bx-text" href="/flutegang/reactions" text="Words"></SidebarOption>
      </SidebarGroup>
    </Fragment>
  )
}

export function DesktopSidebar() {
  return (
    <div className='flex sticky top-0 h-screen w-72 bg-str-bleck-200 items-center flex-col z-20 flex-shrink-0'>
      <div className='flex items-center justify-center p-2'>
          <Link href="/flutegang" passHref>
            <Image src={ExylLogoTransparent} width={92} height={92} alt="Exyl logo"></Image>
          </Link>
      </div>
      <div className="h-full w-full">
        {/* <h1 className="font-black italic text-5xl p-4 text-center">EGGBOT</h1> */}
        <SidebarLinks/>
      </div>
      <div className='p-4'>
        <p>made with 💜 by Mae</p>
      </div>
    </div>
  )
}

export function MobileSidebar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='flex sticky top-0 w-full bg-str-bleck-200 items-center flex-col z-20 flex-shrink-0'>
      <div className='w-full'>
        <div className="flex items-center justify-between p-2">
          <Link href="/flutegang" passHref>
            <Image src={ExylLogoTransparent} width={64} height={64} alt="Exyl logo"></Image>
          </Link>
          <div onClick={() => setIsOpen(!isOpen)} className="w-12 h-12 flex items-center">
            <i className='bx bx-menu bx-md hover:cursor-pointer'></i>
          </div>
        </div>
      </div>
      <div hidden={!isOpen} className='w-full px-4'>
        <SidebarLinks/>
        <div className='py-4'>
          <p>made with 💜 by Mae</p>
        </div>
      </div>
    </div>
  )
}