import React, { Fragment, useState } from 'react'
import { Dialog, Menu, Transition } from '@headlessui/react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import {
  PlusCircleIcon,
  QueueListIcon,
  CalendarDaysIcon,
  HomeIcon,
  TableCellsIcon,
  XMarkIcon,
  Bars3Icon,
  CalendarDateRangeIcon
} from '@heroicons/react/24/outline'

import serverUrl from '../var/serverUrl'


const Test : React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user, setUser } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()

  const navigation = [
  { name: 'Dashboard', to: '/dashboard', icon: HomeIcon },
  { name: 'Transactions', to: '/transactions', icon: QueueListIcon },
  { name: 'Create Transaction', to: '/createtransaction', icon: PlusCircleIcon },
  { name: 'Journal', to: '/journal', icon: TableCellsIcon },
  { name: 'Holidays', to: '/holidays', icon: CalendarDaysIcon },
  { name: 'Create Holiday', to: '/createholiday', icon: CalendarDateRangeIcon },
]

const handleLogout = async () => {
        try {
            const res = await fetch(`${serverUrl}/api/auth/logout`, {
                method: 'GET',
                credentials: 'include'
            });
            if (!res.ok) {
                throw new Error('Logout failed');
            }
            const data = await res.json();
            if (data.status) {
                setUser(null);
                localStorage.removeItem('boj-user')
                toast.success(data.message);
                navigate('/login');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'An error occurred while logging out.');
        }
    }

  return (
    <div className="h-full">
      {/* Mobile sidebar */ user &&
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 flex z-40">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex w-full max-w-xs flex-1 flex-col bg-white">
                <div className="absolute top-0 right-0">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon className="h-6 w-6 text-black" aria-hidden="true" />
                  </button>
                </div>
                <div className="h-0 flex-1 overflow-y-auto pt-5 pb-4">
                  <nav className="mt-5 space-y-1 px-2">
                    {navigation.map((item) => (
                      <button
                        key={item.name}
                        onClick={() =>{ navigate(item.to); setSidebarOpen(false);}}
                        className={`${item.to === location.pathname ? 'bg-blue-300 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} w-full group flex items-center rounded-md px-2 py-2 text-base font-medium`}
                      >
                        <item.icon className="mr-4 h-6 w-6 flex-shrink-0 text-gray-400" aria-hidden="true" />
                        {item.name}
                      </button>
                    ))}
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
           
          </div>
        </Dialog>
      </Transition.Root>
}
      {/* Static sidebar for desktop */ user &&
      <div className="hidden lg:fixed lg:pt-16 lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex min-h-0 flex-1 flex-col border-r border-gray-200 bg-white">
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 space-y-1 px-2 py-4">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => navigate(item.to)}
                  className={`${item.to === location.pathname ? 'bg-blue-300 text-gray-900' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'} w-full group flex items-center rounded-md px-2 py-2 text-sm font-medium`}
                >
                  <item.icon className="mr-3 h-6 w-6 flex-shrink-0 text-gray-400" aria-hidden="true" />
                  {item.name}
                </button>
              ))}
            </nav>
          </div>
          
        </div>
      </div>
}
      <div className="lg:pl-0 lg:sticky top-0 z-10">
        <div className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-x-4 border-b bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          {user && 
          <button type="button" className="-ml-0.5 -mr-1 h-12 w-12 rounded-md bg-white p-2 text-gray-500 lg:hidden" onClick={() => setSidebarOpen(true)}>
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>}

          <div className="flex flex-1 gap-x-4 px-4 sm:gap-x-6 sm:px-0">
            <div className="flex flex-1 items-center gap-x-4">
              <p onClick={() => navigate(user?'/dashboard':'/')} className='text-xl font-bold text-blue-500'>Bo Journal</p>
            </div>
            <div className="flex items-center gap-x-4">

              {/* Profile dropdown */}
              <Menu as="div" className="relative">
                {user &&
                <div>
                  <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <span className="sr-only">Open user menu</span>
                    <p className="h-8 w-8 rounded-full bg-gray-200 flex justify-center items-center">{user?.first_name.charAt(0).toUpperCase()}</p>
                  </Menu.Button>
                </div>}
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Menu.Item>
                      {({ active }) => (
                        <button onClick={() => navigate('/user')} className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}>
                          Profile
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button onClick={() => handleLogout() } className={`${active ? 'bg-gray-100' : ''} block px-4 py-2 text-sm text-gray-700`}>
                          Sign out
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>
      </div>
      <main className={`flex-1  ${user?'lg:pl-64':''}`}>
        <div className="p-4 bg-blue-400" >
        <Outlet />
        </div>
      </main>
    </div >
  )
}


export default Test;