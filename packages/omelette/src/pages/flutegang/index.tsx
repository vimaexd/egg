import Image from 'next/image'
import React from 'react'

import Dashboard from '@components/dashboard/Dashboard'
import SatoriWordmark from '@components/SatoriWordmark';
import SatoriHead from '@components/SatoriHead';

export default function Index() {
  return (
    <Dashboard centerVertical={true} centerHorizontal={true}>
      <SatoriHead 
      title="Flute Gang" 
      description="The home for all Flute Gang related Satori function"
      />
      <SatoriWordmark size="text-7xl"/>
    </Dashboard>
  )
}
