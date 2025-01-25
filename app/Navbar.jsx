import Link from 'next/link'
import React from 'react'

const Navbar = () => {
  return (
    <div className='h-10 w-full fixed top-0 bg-black '>
        <Link href="/" className='text-white font-bold text-4xl left-2 absolute cursor-pointer'>MusiX</Link>
        <Link href="/upload" className='h-10 hover:text-white hover:bg-transparent right-0 p-2 absolute bg-slate-300'>Upload a song</Link>
        <Link href="/songs"  className='h-10 hover:text-white hover:bg-transparent right-32 p-2 absolute bg-slate-300'>All songs</Link>
    </div>
  )
}

export default Navbar