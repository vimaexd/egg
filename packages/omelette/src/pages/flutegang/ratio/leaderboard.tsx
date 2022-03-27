import { formatDistanceToNowStrict } from 'date-fns';
import Image from 'next/image'
import dynamic from 'next/dynamic'
import React, { useEffect, useRef, useState } from 'react'
import anime from 'animejs'
const Anime = dynamic(() => import('react-anime'), {ssr: false})

import Dashboard from '@components/dashboard/Dashboard'
import DashboardTitle from '@components/dashboard/DashboardTitle';
import LeaderboardEntry from '@components/leaderboard/LeaderboardEntry';
import LoadingSpinner from '@components/LoadingSpinner';
import useEggbotApi, { EggbotApi } from '@hooks/useEggbotApi';
import DashboardColumn from '@components/dashboard/DashboardColumn';
import EggbotHead from '@components/EggbotHead';


export default function Leaderboard() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(0);
  const [isFinalPage, setIsFinalPage] = useState(false);

  const [needsFetch, setNeedsFetch] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPageAndAppend = async () => {
      if(isFinalPage) return;
      setLoading(true);
      const res = await EggbotApi.get(`/flutegang/leaderboard/${page}`)
      if(res.data.counts.length < 15){
        console.log("we've reached the end")
        setIsFinalPage(true);
      }
      setData([...data, ...res.data.counts])
  
      setLoading(false);
    }

    if(needsFetch && !loading){
      setNeedsFetch(false)
      setPage(page + 1);
      fetchPageAndAppend();
    }
  }, [data, isFinalPage, loading, needsFetch, page])

  if(typeof window !== 'undefined'){
    window.addEventListener('scroll', async (e: any) => {
      if(
        window.innerHeight + e.target.documentElement.scrollTop + 1 >=
        e.target.documentElement.scrollHeight
      ) {
        if(!needsFetch && !loading) setNeedsFetch(true)
      }
    });
  }


  return (
    <Dashboard centerHorizontal={true}>
        <EggbotHead 
        title="Ratio Battle Leaderboard" 
        description="Wanna show off on how much of a Twitter user you are? Find your rank on the Ratio Battle Leaderboard"
        />
        <DashboardTitle>Leaderboard</DashboardTitle>
        <DashboardColumn>
          <Anime translateX={["-40px", "0px"]} opacity={[0, 1]} easing="easeOutExpo">
            {
              data.map((e, i) => (
                  <LeaderboardEntry entry={e} index={i} key={i}/>
              ))
            }
            {
              (loading) && <LoadingSpinner fill="#fff" className='w-8 h-8'/>
            }
          </Anime>
        </DashboardColumn>
    </Dashboard>
  )
}
