import React from 'react'

interface EggbotWordmarkProps {
  size: string;
}

export default function EggbotWordmark(props: EggbotWordmarkProps) {
  return (
    <h1 
    className={
      (props.size || 'text-7xl') 
      + ' font-black italic bg-gradient-to-r from-exyl-orange to-exyl-red bg-clip-text text-transparent p-2'
    }
    style={{
      filter: "drop-shadow(4px 4px #fff)"
    }}
    >
    EGGBOT
    </h1>
  )
}
