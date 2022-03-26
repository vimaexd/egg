import React, { Fragment } from 'react'

interface SidebarGroupHeaderProps {
  name: string;
  children: React.ReactNode;
}

export default function SidebarGroupHeader(props: SidebarGroupHeaderProps) {
  return (
    <div className='py-2'>
      <div className='mx-2 my-1 font-small font-bold'>
        {props.name}
      </div>
      {props.children}
    </div>
  )
}
