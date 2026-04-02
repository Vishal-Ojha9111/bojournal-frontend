import React from 'react'

type Props = {
	amount?: number
	description?: string
	date?: string
	onSave?: (payload: {amount: number; description?: string; date?: string}) => void
	onCancel?: () => void
}

const EditTransaction: React.FC<Props> = ({ amount = 0, description = '', date = '', onSave, onCancel }) => {
	const [localAmount, setLocalAmount] = React.useState<number | string>(amount)
	const [localDescription, setLocalDescription] = React.useState(description)
	const [localDate, setLocalDate] = React.useState(date)

	return (
		<div className="p-4 bg-white rounded shadow">
			<h3 className="text-lg font-medium mb-2">Edit Transaction</h3>
			<label className="block text-sm">Amount</label>
			<input type="number" className="w-full border p-2 rounded mb-2" value={localAmount} onChange={(e) => setLocalAmount(Number(e.target.value))} />
			<label className="block text-sm">Description</label>
			<input className="w-full border p-2 rounded mb-2" value={localDescription} onChange={(e) => setLocalDescription(e.target.value)} />
			<label className="block text-sm">Date</label>
			<input type="date" className="w-full border p-2 rounded mb-2" value={localDate} onChange={(e) => setLocalDate(e.target.value)} />
			<div className="flex gap-2 justify-end">
				<button onClick={() => onCancel && onCancel()} className="px-3 py-1 rounded border">Cancel</button>
				<button onClick={() => onSave && onSave({amount: Number(localAmount), description: localDescription, date: localDate})} className="px-3 py-1 rounded bg-blue-600 text-white">Save</button>
			</div>
		</div>
	)
}

export default EditTransaction

