import Head from 'next/head'
import React from 'react'
import AdminPage from '../../components/Admin/AdminPage'

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