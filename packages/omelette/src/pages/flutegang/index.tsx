import Image from 'next/image'
import React from 'react'

import Dashboard from '../../components/dashboard/Dashboard'
import EggbotWordmark from '../../components/EggbotWordmark';

import EggHeavenly from '../../assets/egg_heaven.png';

export default function Index() {
  return (
    <Dashboard centerVertical={true} centerHorizontal={true}>
      <EggbotWordmark size="text-7xl"/>
    </Dashboard>
  )
}
