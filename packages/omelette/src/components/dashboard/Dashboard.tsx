import React from 'react'
import { DesktopSidebar, MobileSidebar } from './Sidebar'

interface DashboardProps {
  centerVertical?: boolean;
  centerHorizontal?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function Dashboard(props: DashboardProps) {
  let additionalContentClasses = '';
  if(props.centerVertical || props.centerHorizontal) {
    additionalContentClasses += ' flex flex-col'
  }

  if(props.centerVertical)
    additionalContentClasses += ' justify-center'
  
  if(props.centerHorizontal) 
    additionalContentClasses += ' items-center'

  if(props.className)
    additionalContentClasses += ' ' + props.className

  return (
    <div className='bg-black text-white min-h-screen flex flex-col md:flex-row'>
      <div className='hidden md:flex'>
        <DesktopSidebar/>
      </div>
      <div className='flex md:hidden'>
        <MobileSidebar/>
      </div>
      <div className={'w-full h-full md:h-screen flex-grow' + additionalContentClasses}>
        {props.children}
      </div>
    </div>
  )
}