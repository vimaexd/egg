import { formatDistanceToNowStrict } from 'date-fns';
import Image from 'next/image'
import dynamic from 'next/dynamic'
import React, { useEffect, useRef, useState } from 'react'
import anime from 'animejs'
const Anime = dynamic(() => import('react-anime'), {ssr: false})

import Dashboard from '../../../components/dashboard/Dashboard'
import DashboardTitle from '../../../components/dashboard/DashboardTitle';
import LeaderboardEntry from '../../../components/leaderboard/LeaderboardEntry';
import LoadingSpinner from '../../../components/LoadingSpinner';
import useEggbotApi, { EggbotApi } from '../../../hooks/useEggbotApi';


export default function Leaderboard() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [isFinalPage, setIsFinalPage] = useState(false);

  const [needsFetch, setNeedsFetch] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPageAndAppend = async () => {
      setLoading(true);
      const res = await EggbotApi.get(`/flutegang/leaderboard/${page}`)
      if(res.data.counts.length < 15){
        setIsFinalPage(true);
      }
      setData([...res.data.counts, ...data])
  
      // dummy data
      setLoading(false);
    }
  
    if(data.length == 0) {
      fetchPageAndAppend();
    }

    if(needsFetch && !loading){
      setNeedsFetch(false)
      setPage(page + 1);
      fetchPageAndAppend();
    }
  }, [data, loading, needsFetch, page])

  if(typeof window !== 'undefined'){
    window.addEventListener('scroll', async (e: any) => {
      if(isFinalPage) return;
      console.log(e.target.documentElement.scrollTop, window.innerHeight, e.target.documentElement.scrollHeight)
      if(
        window.innerHeight + e.target.documentElement.scrollTop + 1 >=
        e.target.documentElement.scrollHeight
      ) {
        if(isFinalPage) return;
        if(!needsFetch && !loading) setNeedsFetch(true)
      }
    });
  }


  return (
    <Dashboard centerHorizontal={true}>
        <DashboardTitle>Leaderboard</DashboardTitle>
        <div className='w-3/6'>
          <div>
            {
              data.map((e, i) => (
                <Anime translateX={["-40px", "0px"]} opacity={[0, 1]} easing="easeOutExpo" key={i}>
                  <LeaderboardEntry entry={e} index={i}/>
                </Anime>
              ))
            }
            {
              (loading) && <LoadingSpinner fill="#fff" className='w-8 h-8'/>
            }
          </div>
        </div>
    </Dashboard>
  )
}
