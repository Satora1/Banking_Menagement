import HeaderBox from '@/components/HeaderBox'
import RightSidebar from '@/components/RightSidebar';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import React from 'react'

const Home = () => {
  const loggedIn = { firstName: "Kuba", lastName: "SA", email: "satorakuba@gmail.com" };

  return (
    <section className='home'>
      <div className='home-content'>
        <header className='home-header'>
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={loggedIn?.firstName || "Guest"}
            subtext="Acces and menage your account and transctions" />
          <TotalBalanceBox
            accounts={[]}
            totalBanks={1}
            totalCurrentBalance={125.34}
          />
        </header>
        RECENT TRANSACTIONS
      </div>
      <RightSidebar
        user={loggedIn}
        transactions={[]}
        banks={[{ currentBalance: 154.23 }, { currentBalance: 767.90 }]}
      />
    </section>
  )
}

export default Home