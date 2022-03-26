import { formatDistanceToNowStrict } from 'date-fns';
import Image from 'next/image'
import React, { Fragment, useEffect, useState } from 'react'

import Dashboard from '../../../components/dashboard/Dashboard'
import DashboardTitle from '../../../components/dashboard/DashboardTitle';
import LoadingSpinner from '../../../components/LoadingSpinner';
import useEggbotApi from '../../../hooks/useEggbotApi';


export default function Index() {
  const [hasExpired, setExpired] = useState(false);
  const [{ data, loading, error }] = useEggbotApi(
    '/flutegang/cooldown'
  )

  useEffect(() => {
    if(!loading){
      if(data.expires < Date.now()) setExpired(true);
    }
  }, [data, loading])

  return (
    <Dashboard centerHorizontal={true}>
        <DashboardTitle>Cooldown</DashboardTitle>
        <div className='w-3/6'>
          <div className='p-4 bg-str-bleck-200 rounded-md border-l-8 border-l-exyl-red'>
            <div className='flex items-center'>
              {
                (loading)
                ? (
                  <div className='space-x-2 flex items-center'>
                    <LoadingSpinner fill="#fff" className='w-8 h-8'/>
                    <p className='text-md pr-4'>
                      Loading cooldown..
                    </p>
                  </div>
                )
                :
                  (hasExpired)
                  ? (
                    <Fragment>
                      <span className='text-2xl'>✅</span>
                      <p className='text-md pr-4'>The cooldown has expired!</p>
                    </Fragment>
                  )
                  : (
                    <Fragment>
                      <span className='text-2xl'>🕑</span>
                      <p className='text-md pr-4'>
                        The cooldown will expire in <b>
                          {formatDistanceToNowStrict(new Date(data.expires))}
                          </b>
                      </p>
                    </Fragment>
                  )
              }
            </div>
          </div>
          <div className='py-4'>
              <h2 className='font-bold'>Why is there a cooldown?</h2>
              <p>
                A cooldown is in place to prevent spam of the feature and to increase the rarity and enjoyment of each battle in chat.
              </p>
          </div>
          <div className='py-4'>
              <h2 className='font-bold'>How long is the cooldown?</h2>
              <p>
                The cooldown lasts 30 minutes from the time that the battle is triggered.
                Bot restarts will also reset any active cooldowns.
              </p>
          </div>
          <div className='py-4'>
              <h2 className='font-bold'>Can you skip the cooldown?</h2>
              <p>
                Moderators have the ability to skip the cooldown, however please do not constantly ask them to do so.
              </p>
          </div>
        </div>
    </Dashboard>
  )
}