import React from 'react'

type Props = {
	name?: string
	description?: string
	debit?: boolean
	credit?: boolean
	onSave?: (payload: {name: string; description?: string; debit: boolean; credit: boolean}) => void
	onCancel?: () => void
}

const EditRegister: React.FC<Props> = ({ name = '', description = '', debit = false, credit = false, onSave, onCancel }) => {
	const [localName, setLocalName] = React.useState(name)
	const [localDescription, setLocalDescription] = React.useState(description || '')
	const [localDebit, setLocalDebit] = React.useState(debit)
	const [localCredit, setLocalCredit] = React.useState(credit)

	return (
		<div className="p-4 bg-white rounded shadow">
			<h3 className="text-lg font-medium mb-2">Edit Register</h3>
			<label className="block text-sm">Name</label>
			<input className="w-full border p-2 rounded mb-2" value={localName} onChange={(e) => setLocalName(e.target.value)} />
			<label className="block text-sm">Description</label>
			<input className="w-full border p-2 rounded mb-2" value={localDescription} onChange={(e) => setLocalDescription(e.target.value)} />
			<div className="flex gap-4 items-center mb-2">
				<label className="flex items-center gap-2"><input type="checkbox" checked={localDebit} onChange={(e) => setLocalDebit(e.target.checked)} /> Debit</label>
				<label className="flex items-center gap-2"><input type="checkbox" checked={localCredit} onChange={(e) => setLocalCredit(e.target.checked)} /> Credit</label>
			</div>
			<div className="flex gap-2 justify-end">
				<button onClick={() => onCancel && onCancel()} className="px-3 py-1 rounded border">Cancel</button>
				<button onClick={() => onSave && onSave({name: localName, description: localDescription, debit: localDebit, credit: localCredit})} className="px-3 py-1 rounded bg-blue-600 text-white">Save</button>
			</div>
		</div>
	)
}

export default EditRegister
