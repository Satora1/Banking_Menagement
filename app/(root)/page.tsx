import HeaderBox from '@/components/HeaderBox'
import RightSidebar from '@/components/RightSidebar';
import TotalBalanceBox from '@/components/TotalBalanceBox';
import { getAccount, getAccounts } from '@/lib/actions/bank.actions';
import { getLoggedInUser } from '@/lib/actions/user.actions';
import React from 'react'

const Home = async () => {
  const loggedIn = await getLoggedInUser()
  const accounts = await getAccounts({
    userId: loggedIn.$id
  })
  if (!accounts) return

  const appwriteItemId = (id as string) || accounts?.data[0]?.appwriteItemId
  const account = await getAccount({
    appwriteItemId
  })


  
  return (
    <section className='home'>
      <div className='home-content'>
        <header className='home-header'>
          <HeaderBox
            type="greeting"
            title="Welcome"
            user={loggedIn?.name || "Guest"}
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