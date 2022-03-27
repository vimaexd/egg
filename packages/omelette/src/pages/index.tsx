import Head from 'next/head'
import Image from 'next/image'
import EggbotWordmark from '@components/EggbotWordmark'
import EggbotHead from '@components/EggbotHead'

export default function Home() {
  return (
    <div className="bg-black text-white h-screen flex items-center justify-center flex-col space-y-4">
      <EggbotHead title="Home" description="Flute Gang's premiere shitpost bot"/>
      <EggbotWordmark size="text-7xl"/>
      <a href="https://discord.gg/flute">
        <button className='px-4 py-2 bg-gray-700 rounded-md transition-all hover:-translate-y-2 hover:scale-110'>
          Flute Gang Discord Server
        </button>
      </a>
    </div>
  )
}
