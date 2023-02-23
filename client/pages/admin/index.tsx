import Head from 'next/head'
import React from 'react'
import AdminPage from '../../components/Admin/AdminPage'
import AdminPageMobile from '../../components/Mobile/Admin/AdminPageMobile';
import useMediaQuery from '../../hooks/useMediaQuery';

const admin = () => {
  return (
    <>
    <Head>
        <title>Admin Dashboard</title>
    </Head>
    <AdminPage/>
    </>
  )
}

export default admin