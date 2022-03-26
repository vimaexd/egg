import React from 'react'
import Sidebar from './Sidebar'

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
    <div className='bg-black text-white min-h-screen flex'>
      <Sidebar/>
      <div className={'w-full' + additionalContentClasses}>
        {props.children}
      </div>
    </div>
  )
}