import { useRouter } from 'next/router';
import React from 'react'

interface SidebarOptionProps {
  text: string;
  icon?: string;
  href?: string;
  onClick?: () => void;
}

export default function SidebarOption(props: SidebarOptionProps) {
  const router = useRouter();
  const interceptOnClick = () => {
    if(props.href){
      router.push(props.href)
    } else {
      props.onClick();
    }
  }
  
  return (
    <div 
    className='bg-stone-800 hover:bg-exyl-orange w-full p-4 md:hover:translate-x-4 hover:cursor-pointer hover:rounded-lg transition-all my-1' 
    onClick={interceptOnClick}
    >
      <div className='flex space-x-4 items-center'>
        {props.icon && <div className={props.icon + " pr-2"}></div>}
        {props.text || "SidebarOption"}
      </div>
    </div>
  )
}
