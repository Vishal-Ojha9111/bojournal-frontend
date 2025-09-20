import React, { useEffect, useState, useRef, useCallback, Fragment } from 'react'
import type { Transaction, ImageFile, PresignedUrl } from '../types/client/Transactions'
import toast from 'react-hot-toast'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import type { PickerValue } from '@mui/x-date-pickers/internals'
import { useAuth } from '../context/AuthContext'
import dayjs, { Dayjs } from 'dayjs'
import { Label, Listbox, ListboxButton, ListboxOption, ListboxOptions, Transition } from '@headlessui/react'
import { ChevronUpDownIcon } from '@heroicons/react/16/solid'
import { CheckIcon } from '@heroicons/react/20/solid'
import serverUrl from '../var/serverUrl'

type ImageSlot = {
	id: string
	file: File | null
	preview: string | null
}

const CreateTransaction: React.FC = () => {
  const { user, csrfToken } = useAuth()
  const [transactionData, setTransactionData] = useState<Transaction>({
    amount: null,
    transaction_type: '',
    register: '',
    date: dayjs(new Date()).format('YYYY-MM-DD'),
    image_keys: [],
    description: ''
  })

  const [images, setImages] = useState<ImageFile[]>([])
  const [uploadedKeys, setUploadedKeys] = useState<Set<string>>(new Set())
  const [isNewRegister, setIsNewRegister] = useState<boolean>(false)
  const [newRegister, setNewRegister] = useState<string | undefined>(user?.register_types[0])
  // backend returns created transaction which likely includes an `id` field not present in our `Transaction` interface
  const [successTransaction, setSuccessTransaction] = useState<unknown>(null)

  const uploadImages = async () => {
    const newUploads = images.filter(img => img.key && !uploadedKeys.has(img.key))
    try {
      const uploadPromises = newUploads.map(async (image) => {
        if (!image.file || !image.presignedUrl || !image.key) return
        const res = await fetch(image.presignedUrl, { method: 'PUT', body: image.file, headers: { 'Content-Type': image.file.type } })
        const data = await res.text()
        toast.error(data)
        if (!res.ok) throw new Error(`Failed to upload image: ${image.file.name}`)
      })
      const results = await Promise.allSettled(uploadPromises)
      const failures = results.filter(r => r.status === 'rejected')
      if (failures.length > 0) throw new Error(`Failed to upload ${failures.length} images`)
      setSlots([])
    } catch (err: unknown) {
      await cleanupFailedUploads()
      throw err
    }
  }

  const cleanupFailedUploads = async () => {
    try {
      await fetch(`${serverUrl}/api/transactions/cleanup/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ keys: Array.from(uploadedKeys) }) })
      setUploadedKeys(new Set())
    } catch (error: unknown) {
      console.error('Failed to cleanup uploaded files:', error)
    }
  }

  const handleTransactionCreation = async (e: React.FormEvent) => {
    e.preventDefault()
    if(isNewRegister){
      transactionData.register = newRegister || null
    }
    if (!transactionData.amount || !transactionData.transaction_type || !transactionData.register || !transactionData.date) {
      toast.error('Please fill all required fields')
      return
    }
    try {
      const res = await fetch(`${serverUrl}/api/transactions/`, { method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json', 'X-CSRFToken': csrfToken || '' }, body: JSON.stringify(transactionData) })
      const data = await res.json()
      if (!res.ok) {
        if (data.errors) throw new Error(Object.values(data.errors).join(', '))
        throw new Error(data.message || 'Failed to create transaction')
      }
      setSuccessTransaction(data)
      if (images.length > 0) await uploadImages()
      toast.success(data.message || 'Transaction created successfully')
      setImages([])
      setUploadedKeys(new Set())
      setTransactionData({ amount: null, transaction_type: '', register: '', date: dayjs(new Date()).format('YYYY-MM-DD'), image_keys: [], description: '' })
    } catch (error: unknown) {
      const e = error as Error
      toast.error(e?.message || 'An unexpected error occurred')
      transactionCleanup()
    }
  }

  const transactionCleanup = async () => {
    try {
      let id: string | number | null = null
      if (successTransaction && typeof successTransaction === 'object') {
        const obj = successTransaction as Record<string, unknown>
        if ('id' in obj) {
          const val = obj['id']
          if (typeof val === 'string' || typeof val === 'number') id = val
        }
      }
      if (!id) return
      const res = await fetch(`${serverUrl}/api/transactions/${id}/`, { method: 'DELETE', credentials: 'include', headers: { 'X-CSRFToken': csrfToken || '' } })
      if (!res.ok) throw new Error('Failed to cleanup transactions')
    } catch (error) {
      console.error('Error during transaction cleanup:', error)
    }
  }

  const getPresignedUrl = useCallback(async (type: string, extension: string): Promise<PresignedUrl | undefined> => {
    try {
      const res = await fetch(`${serverUrl}/api/transactions/presign/`, { method: 'POST', credentials: 'include', headers: { 'content-type': 'application/json', 'x-CSRFToken': csrfToken || '' }, body: JSON.stringify({ content_type: type, extension }) })
      if (res.status >= 500) throw new Error('Internal Server Error: Setting presigned URL.')
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.message || 'Some error occurred while setting presigned URL.')
      }
      const data: PresignedUrl = await res.json()
      return data
    } catch (error: unknown) {
      const e = error as Error
      toast.error(e?.message || 'Failed to get presigned url')
    }
  }, [csrfToken])

  useEffect(() => {
    if (transactionData.register === 'New Register') {
      setIsNewRegister(true)
      setNewRegister('')
    } else if (user?.register_types.includes(transactionData.register || '')) {
      setIsNewRegister(false)
      setNewRegister('')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionData.register])


  const [slots, setSlots] = useState<ImageSlot[]>([])
    const timeouts = useRef<Record<string, number>>({})
  
    const addEmptySlot = useCallback(() => {
        const getRandomId = () => {
          return String(Date.now())
        }
        const id = getRandomId()
      setSlots(s => [...s, { id, file: null, preview: null }])
    }, [])
  
    const removeSlot = useCallback((id: string) => {
      setSlots(s => s.filter(x => x.id !== id))
    }, [])
  
    const onFileChosen = useCallback( async (id: string, file: File | null) => {
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        const preview = String(reader.result)
        setSlots(s => s.map(slot => slot.id === id ? { ...slot, file, preview } : slot))
      }
      reader.readAsDataURL(file)
      const presignedUrl = await getPresignedUrl(file.type, file.name.split('.').pop() || '')
      if (presignedUrl) {
        setTransactionData(prev => ({ ...prev, image_keys: [...prev.image_keys, presignedUrl.key] }))
        setImages(prev => [...prev, { file, preview: String(reader.result), key: presignedUrl.key,presignedUrl:presignedUrl.upload_url }])
      }
    }, [getPresignedUrl])
  
    const handleImageClick = useCallback((id: string) => {
      const el = document.getElementById(`actions-${id}`)
      if (!el) return
      el.classList.remove('hidden')
      el.classList.add('flex')
      if (timeouts.current[id]) window.clearTimeout(timeouts.current[id])
      timeouts.current[id] = window.setTimeout(() => {
        el.classList.add('hidden')
        delete timeouts.current[id]
      }, 3000)
    }, [])
  
    const viewInNewTab = useCallback((preview: string | null) => {
      if (!preview) return
      const w = window.open()
      if (w) {
        w.document.write(`<img src="${preview}" style="max-width:100%;height:auto"/>`)
        w.document.close()
      }
    }, [])



  return (
    <div className="max-w-full mx-auto p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-semibold mb-4">Create Transaction</h1>
      <form onSubmit={handleTransactionCreation} className="space-y-4">
        <div>
              <label htmlFor="amount" className="w-fit text-sm leading-6 font-medium text-black">
                Amount *
              </label>
              <div className="mt-1 max-w-80">
                      <div className="flex items-center rounded-md bg-gray-200 pl-3 ring-1 ring-gray-600 ring-offset-0 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-0">
                  <div className="shrink-0 text-base bg-inherit text-black select-none sm:text-sm sm:leading-6">₹</div>
                  <input
                    id="amount"
                    name="amount"
                    type="number"
                    onChange={(e) => setTransactionData({ ...transactionData, amount: Number(e.target.value) })}
                    value={(transactionData.amount !== null && transactionData.amount !== 0) ? transactionData.amount : ''}
                    placeholder="0.00"
                    className="block min-w-0 grow bg-inherit rounded-full py-1.5 pr-3 pl-1 text-base text-black placeholder:text-gray-700 focus:outline-none sm:text-sm sm:leading-6"
                  />            
                </div>
              </div>
            </div>

        <div className="grid grid-rows-2 gap-0">
          <Listbox value={transactionData.transaction_type} onChange={(e) => setTransactionData({ ...transactionData, transaction_type: e })}>
                <Label className="text-sm w-fit font-medium text-black">Transaction Type *</Label>
                <div className="relative -mt-1 max-w-80">
                  <ListboxButton type='button' className="grid w-full cursor-default grid-cols-1 rounded-md bg-gray-200 py-1.5 pr-2 pl-3 text-left text-black ring-1 ring-white/10 ring-offset-0 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-0 sm:text-sm sm:leading-6">
                    <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
                      <span className="block truncate">{transactionData.transaction_type?transactionData.transaction_type.charAt(0).toUpperCase() + transactionData.transaction_type.slice(1):'Choose transaction type'}</span>
                    </span>
                    <ChevronUpDownIcon aria-hidden="true" className="col-start-1 row-start-1 h-5 w-5 self-center justify-self-end text-gray-400 sm:h-4 sm:w-4" />
                  </ListboxButton>
          
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-150"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-100"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                  >
                  <ListboxOptions className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-gray-800 py-1 text-base ring-1 ring-white/10 ring-offset-0 data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm">
                      <ListboxOption
                        value="debit"
                        className="group relative cursor-default py-2 pr-9 pl-3 text-white select-none data-focus:bg-indigo-500 data-focus:outline-hidden"
                      >
                        <div className="flex items-center">
                          <span className="ml-3 block truncate font-normal group-data-selected:font-semibold">Debit</span>
                        </div>
                        {transactionData.transaction_type === 'debit' &&
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-400 group-not-data-selected:hidden group-data-focus:text-white">
                          <CheckIcon aria-hidden="true" className="h-5 w-5" />
                        </span>
                        }
                      </ListboxOption>
                      <ListboxOption
                        value="credit"
                        className="group relative cursor-default py-2 pr-9 pl-3 text-white select-none data-focus:bg-indigo-500 data-focus:outline-hidden"
                      >
                        <div className="flex items-center">
                          <span className="ml-3 block truncate font-normal group-data-selected:font-semibold">Credit</span>
                        </div>
                        {transactionData.transaction_type === 'credit' &&
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-400 group-not-data-selected:hidden group-data-focus:text-white">
                          <CheckIcon aria-hidden="true" className="h-5 w-5" />
                        </span>
                        }
            </ListboxOption>
          </ListboxOptions>
          </Transition>
                </div>
              </Listbox>
              </div>
              <div className="grid grid-rows-2 gap-0">
          <Listbox value={transactionData.register} onChange={(e) => setTransactionData({ ...transactionData, register: e })}>
            <Label className="block text-sm/6 font-medium w-fit text-black">Register *</Label>
            <div className="relative -mt-1 max-w-80">
              <ListboxButton type='button' className="grid w-full cursor-default grid-cols-1 rounded-md bg-gray-200 py-1.5 pr-2 pl-3 text-left text-black ring-1 ring-white/10 ring-offset-0 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-0 sm:text-sm sm:leading-6">
                <span className="col-start-1 row-start-1 flex items-center gap-3 pr-6">
                  <span className="block truncate text-black">{isNewRegister?"New Register":transactionData.register?transactionData.register:'Choose register'}</span>
                </span>
                <ChevronUpDownIcon aria-hidden="true" className="col-start-1 row-start-1 h-5 w-5 self-center justify-self-end text-gray-400 sm:h-4 sm:w-4" />
              </ListboxButton>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-100"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
              <ListboxOptions className="absolute z-10 mt-1 max-h-56 w-full overflow-auto rounded-md bg-gray-800 py-1 text-base ring-1 ring-white/10 ring-offset-0 data-leave:transition data-leave:duration-100 data-leave:ease-in data-closed:data-leave:opacity-0 sm:text-sm">
               
                <ListboxOption
                    key={"New Register"}
                    value={"New Register"}
                    className="group relative cursor-default py-2 pr-9 pl-3 text-white select-none data-focus:bg-indigo-500 data-focus:outline-hidden"
                  >
                    <div className="flex items-center">
                      <span className="ml-3 block truncate font-normal group-data-selected:font-semibold">New Register</span>
                    </div>
                    {transactionData.register === "New Register" &&
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-400 group-not-data-selected:hidden group-data-focus:text-white">
                      <CheckIcon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    }
                  </ListboxOption>
                {user?.register_types.map((register) => (
                  <ListboxOption
                    key={register}
                    value={register}
                    className="group relative cursor-default py-2 pr-9 pl-3 text-white select-none data-focus:bg-indigo-500 data-focus:outline-hidden"
                  >
                    <div className="flex items-center">
                      <span className="ml-3 block truncate font-normal group-data-selected:font-semibold">{register}</span>
                    </div>
                    {
                      transactionData.register === register && 
                    <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-400 group-not-data-selected:hidden group-data-focus:text-white">
                      <CheckIcon aria-hidden="true" className="h-5 w-5" />
                    </span>
                    }
                  </ListboxOption>
                ))}
              </ListboxOptions>
              </Transition>
            </div>
          </Listbox>
        </div>

        {isNewRegister && (
              <div>
              <label htmlFor="newRegister" className="w-fit text-sm/6 font-medium text-black">
                New Register Name *
              </label>
              <div className="mt-1 max-w-80">
                      <div className="flex items-center rounded-md bg-gray-200 pl-3 outline-1 -outline-offset-1 outline-gray-600 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-0">
                  <input
                    id="newRegister"
                    name="newRegister"
                    type="text"
                    placeholder="Register name"
                    value={newRegister}
                    onChange={(e) => setNewRegister(e.target.value)}
                    className="block min-w-0 grow bg-inherit rounded-full py-1.5 pr-3 pl-1 text-base text-black placeholder:text-gray-700 focus:outline-none sm:text-sm/6"
                  />            
                </div>
              </div>
            </div>
        )}

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date *</label>
          <DatePicker name='date' format='DD-MM-YYYY' value={transactionData?.date ? dayjs(transactionData.date) : dayjs(new Date())} onChange={(value: PickerValue) => setTransactionData({ ...transactionData, date: value ? String((value as Dayjs).format('YYYY-MM-DD')) : '' })} />
        </div>

        <div className="mt-4 max-w-3xl">
			<label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
			<div className="border rounded-lg p-3 bg-white flex overflow-auto">
				{slots.length === 0 ? (
					<div className="flex items-center justify-center w-44 h-52 border-dashed border-2 border-gray-300">
						<button type='button' onClick={addEmptySlot} className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded text-nowrap">Add Image</button>
					</div>
				) : (
					<div className="flex gap-2 items-center justify-center">
						{slots.map(slot => (
							<div key={slot.id} className="relative border rounded-lg p-2 bg-gray-50">
								{!slot.preview ? (
									<div className="border-gray-300 border-2 border-dashed h-52 w-32 flex items-center justify-center rounded cursor-pointer">
										<div className="flex flex-col gap-2">
											<label className="inline-flex items-center px-2 py-1 bg-white border rounded cursor-pointer">
												<input type="file" accept="image/*" className="hidden" onChange={(e) => onFileChosen(slot.id, e.target.files?.[0] ?? null)} />
												Select
											</label>
											<label className="inline-flex items-center px-2 py-1 bg-white border rounded cursor-pointer">
												<input type="file" accept="image/*" capture className="hidden" onChange={(e) => onFileChosen(slot.id, e.target.files?.[0] ?? null)} />
												Capture
											</label>
											<button type='button' onClick={() => removeSlot(slot.id)} className="inline-flex items-center px-2 py-1 bg-red-50 text-red-600 border rounded">Remove</button>
										</div>
									</div>
								) : (
									<div className='h-52 w-32'>
										<img src={slot.preview} alt="preview" className="h-52 w-32 object-cover rounded cursor-pointer" onClick={() => handleImageClick(slot.id)} />
										<div id={`actions-${slot.id}`} className="absolute top-0 h-52 w-32 hidden flex-col justify-center px-4 gap-3">
											<button type='button' onClick={() => { removeSlot(slot.id) }} className="px-2 py-1 bg-red-600 text-white text-sm rounded">Remove</button>
											<button type='button' onClick={() => viewInNewTab(slot.preview)} className="px-2 py-1 bg-white text-sm rounded border">View</button>
										</div>
									</div>
								)}
							</div>
						))}
						<div className="flex items-center justify-center w-44 h-52 border-dashed border-2 border-gray-300 shrink-0">
							<button onClick={addEmptySlot} type='button' className="inline-flex items-center px-3 py-2 bg-indigo-600 text-white rounded text-nowrap">Add Image</button>
						</div>
					</div>
				)}
			</div>
		</div>

        <div className="flex justify-end">
          <button type='submit' className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded">Save transaction</button>
        </div>
      </form>
    </div>
  )
}

export default CreateTransaction