import { formatDistanceToNowStrict } from 'date-fns';
import Image from 'next/image'
import React, { Fragment, useEffect, useState } from 'react'

import ReactionDemo from '@assets/rw_demo.png';
import Dashboard from '@components/dashboard/Dashboard'
import DashboardColumn from '@components/dashboard/DashboardColumn';
import DashboardTitle from '@components/dashboard/DashboardTitle';
import LoadingSpinner from '@components/LoadingSpinner';
import useEggbotApi from '@hooks/useEggbotApi';
import EggbotHead from '@components/EggbotHead';


export default function Index() {
  const [hasExpired, setExpired] = useState(false);
  const [{ data, loading, error }] = useEggbotApi(
    '/flutegang/reactwords'
  )

  return (
    <Dashboard centerHorizontal={true}>
        <EggbotHead 
        title="Reaction Words" 
        description="Type something funny? There's a Reaction Word for that"
        />
        <DashboardTitle>Reaction Words</DashboardTitle>
        <DashboardColumn>
          <Image src={ReactionDemo} height={113} alt="Demo" className='rounded-lg' layout='responsive'></Image>
          <div className='py-4'>
              <h2 className='font-bold'>What are Reaction Words?</h2>
              <p>
                Reaction words are words that will trigger an emoji reaction when typed in a sentance in chat
              </p>
          </div>
          <div className='py-4'>
              <h2 className='font-bold'>The reaction isn&apos;t working!</h2>
              <p>
                It&apos;s probably due to one of the following:
                <ul className='list-disc list-inside'>
                  <li>A moderator temporarily disabling the feature</li>
                  <li>Eggbot going down/undergoing maintainence</li>
                  <li>
                    <a href="https://discordstatus.com">
                      <span className='text-blue-200'>Discord having an API outage</span>
                      <i className='bx bx-link-external mx-1 relative top-0.5'></i>
                    </a>
                  </li>
                  {/* <li className='line-through decoration-solid'>
                    Bodge ate the servers
                  </li> */}
                </ul>
              </p>
          </div>

          <div className='py-4'>
            <h2 className='font-bold'>Active reaction emoji</h2>
            <div className='flex flex-row'>
              {
                (loading)
                ? <LoadingSpinner fill="#fff" className='w-8 h-8'/>
                : data.words.map((w, i) => (
                  <div key={i} className="px-1">
                    {
                      (w.startsWith("<"))
                      ?
                      <Image
                      src={"https://cdn.discordapp.com/emojis/" + w.replace("<", "").replace(">", "").split(":")[2] + ".webp?size=64"}
                      height={44}
                      width={44}
                      layout="fixed"
                      alt="Emote"
                      ></Image>
                      :
                      <h3 className='text-4xl'>{w}</h3>
                    }
                  </div>
                ))
              }
            </div>
          </div>
          </DashboardColumn>
    </Dashboard>
  )
}