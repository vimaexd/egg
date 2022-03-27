import Image from 'next/image'
import React from 'react'

import Dashboard from '@components/dashboard/Dashboard'
import EggbotWordmark from '@components/EggbotWordmark';
import EggbotHead from '@components/EggbotHead';

export default function Index() {
  return (
    <Dashboard centerVertical={true} centerHorizontal={true}>
      <EggbotHead 
      title="Flute Gang" 
      description="The home for all Flute Gang related Eggbot function"
      />
      <EggbotWordmark size="text-7xl"/>
    </Dashboard>
  )
}
