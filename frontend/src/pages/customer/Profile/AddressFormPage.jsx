/**
 * AddressFormPage.jsx — Form Page for Creating & Editing Addresses with Google Maps
 */

import { useParams, useNavigate } from 'react'
import AddressMapModal from '../../../components/common/AddressMapModal.jsx'
import useAddresses from '../../../hooks/useAddresses.js'

export default function AddressFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { addresses, addAddress, updateAddress } = useAddresses()

  const isEditing = Boolean(id)
  const existingAddress = isEditing ? addresses.find((a) => a.id === id) : null

  const handleSave = async (formData) => {
    if (isEditing) {
      await updateAddress(id, formData)
    } else {
      await addAddress(formData)
    }
    navigate('/profile/addresses')
  }

  const handleClose = () => {
    navigate('/profile/addresses')
  }

  return (
    <div className="max-w-4xl py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Address' : 'Add New Address'}
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {isEditing ? 'Update delivery address details on Google Maps' : 'Select a new delivery location on Google Maps for fast checkout'}
        </p>
      </div>

      <AddressMapModal
        isOpen={true}
        onClose={handleClose}
        onSaveAddress={handleSave}
        editingAddress={existingAddress}
      />
    </div>
  )
}

