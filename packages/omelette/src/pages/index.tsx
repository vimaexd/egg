import { useEffect, useRef, useState } from 'react';
import Head from 'next/head'
import Image from 'next/image'
import SatoriWordmark from '@components/SatoriWordmark'
import SatoriHead from '@components/SatoriHead'
import SatoriPfpImage from '@assets/satori.png';
import SatoriCityBg from '@assets/bg_city.png';
import Link from 'next/link';
import anime from 'animejs';

export default function Home() {
  return (
    <div
    style={{
      backgroundImage: `url(${SatoriCityBg.src})`,
      backgroundRepeat: "no-repeat",
      backgroundSize: "cover",
      backgroundPosition: "center"
    }}>
      <Watermark/>
      <div
      className="text-white h-screen flex items-center justify-center flex-col space-y-4 backdrop-blur-xl"
      style={{
        background: `rgba(0,0,0, 0.6)`
      }}
      >
        <SatoriHead title="Home" description="Flute Gang's premiere shitpost bot"/>
        <div className='flex items-center space-x-2'>
          <SatoriPFP size={94} className="rounded-full"/>
          <SatoriWordmark size="text-7xl"/>
        </div>
        <div className='text-xl space-y-4'>
          <p>The Discord bot powering Flute Gang.</p>
          <div className='flex flex-col text-3xl'>
            <MainPageLink link='/flutegang' text="dashboard"/>
            <MainPageLink link='https://discord.gg/flute' text="discord" icon="bxl-discord-alt"/>
          </div>
        </div>
        {/* <a href="https://discord.gg/flute">
          <button className='px-4 py-2 bg-gray-700 rounded-md transition-all hover:-translate-y-2 hover:scale-110'>
            Flute Gang Discord Server
          </button>
        </a> */}
      </div>
    </div>
  )
}

function SatoriPFP(props: {size?: number; className?: string;}) {
  const [eggTriggered, setTrigger] = useState(false);
  const [count, setCount] = useState(0);
  const pfp = useRef<HTMLDivElement>();
  const animateFace = () => {
    setCount(count + 1);
    anime({
      targets: pfp.current,
      rotateZ: [0, 360]
    })

    if(count > 20 && !eggTriggered) {
      setTrigger(true);
      const tl = anime.timeline()
      tl.add({
        targets: pfp.current,
        translateX: [0, 40],
        duration: 400,
      })
      tl.add({
        targets: pfp.current.parentElement.children[1],
        translateX: [0, 40],
        rotateZ: [-5, 5],
        easing: 'spring(0.8, 100, 5, 100)'
      }, -100)
      tl.play()
    }
  }

  return (
    <div ref={pfp}>
      <Image
      onClick={animateFace}
      className={props.className || ""}
      src={SatoriPfpImage}
      width={props.size || 32}
      height={props.size || 32}
      alt="Satori Profile Picture"
      />
    </div>
  )
}

function MainPageLink(props: {link: string; text: string; icon?: string;}){
  return (
    <Link href={props.link} passHref={true}>
      <div className='flex cursor-pointer'>
        <p className='font-semibold uppercase tracking-widest hover:font-black hover:tracking-wide transition-all'>{props.text}</p>
        <i className={`bx translate-y-1 translate-x-1 ${props.icon || "bx-link-external"}`}></i>
      </div>
    </Link>
  )
}

function Watermark() {
  return (
    <Link href={"https://mae.wtf"} passHref={true}>
      <div className='cursor-pointer absolute bottom-4 left-4 text-white z-30 text-sm transition-all'>
        <p> A <b>Stringy Software</b> project </p>
      </div>
    </Link>
  )
}