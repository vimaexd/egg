import Head from 'next/head'
import React from 'react'

import SatoriMoustache from '@assets/satori.png';

export default function SatoriHead(props) {
  return (
    <Head>
      <title>{"Satori - " + props.title}</title>
      <meta property="og:title" content={"Satori - " + props.title} />
      <meta property="og:type" content="website" />
      {/* <meta property="og:url" content="http://my.site.com" /> */}
      <meta property="og:image" content={SatoriMoustache.src} />
      <meta property="og:description" content={props.description} />
      <meta name="theme-color" content="#ff0b17"/>
    </Head>
  )
}
