import Head from 'next/head'
import React from 'react'

import EggHeavenly from '@assets/egg_heaven.png';

export default function EggbotHead(props) {
  return (
    <Head>
      <title>{"Eggbot - " + props.title}</title>
      <meta property="og:title" content={"Eggbot - " + props.title} />
      <meta property="og:type" content="website" />
      {/* <meta property="og:url" content="http://my.site.com" /> */}
      <meta property="og:image" content={EggHeavenly.src} />
      <meta property="og:description" content={props.description} />
      <meta name="theme-color" content="#ff0b17"/>
    </Head>
  )
}
