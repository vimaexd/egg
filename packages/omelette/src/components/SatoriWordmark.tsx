import React from 'react'

interface SatoriWordmarkProps {
  size: string;
}

export default function SatoriWordmark(props: SatoriWordmarkProps) {
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
    SATORI
    </h1>
  )
}
