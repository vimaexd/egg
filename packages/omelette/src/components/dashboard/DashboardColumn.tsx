import React from 'react'

export default function DashboardColumn(props) {
  return (
    <div className='w-5/6 xl:w-3/6'>
      {props.children}
    </div>
  )
}
