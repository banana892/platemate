import { useEffect, useState } from 'react'
import { FiPlus, FiMapPin } from 'react-icons/fi'
import AddressCard from '../../../components/customer/AddressCard.jsx'
import AddressMapModal from '../../../components/common/AddressMapModal.jsx'
import ConfirmModal from '../../../components/ui/ConfirmModal.jsx'
import Skeleton from '../../../components/ui/Skeleton.jsx'
import useAddresses from '../../../hooks/useAddresses.js'

export default function AddressesPage() {
  const {
    addresses,
    loading,
    actionLoading,
    fetchAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useAddresses()

  const [deletingAddress, setDeletingAddress] = useState(null)
  const [isMapModalOpen, setIsMapModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)

  useEffect(() => {
    fetchAddresses().catch(() => {})
  }, [fetchAddresses])

  const handleOpenAddModal = () => {
    setEditingAddress(null)
    setIsMapModalOpen(true)
  }

  const handleOpenEditModal = (addr) => {
    setEditingAddress(addr)
    setIsMapModalOpen(true)
  }

  const handleSaveModalAddress = async (addressData) => {
    if (editingAddress) {
      await updateAddress(editingAddress.id, addressData)
    } else {
      await addAddress(addressData)
    }
  }

  const handleConfirmDelete = async () => {
    if (!deletingAddress) return
    try {
      await deleteAddress(deletingAddress.id)
      setDeletingAddress(null)
    } catch {}
  }

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-gray-800">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">Saved Addresses</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage your delivery addresses for seamless checkout</p>
        </div>

        <button
          type="button"
          onClick={handleOpenAddModal}
          className="gradient-bg text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-glow transition-smooth flex items-center justify-center gap-2 cursor-pointer self-start sm:self-auto"
        >
          <FiPlus className="text-base" />
          <span>Add New Address</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton variant="card" className="h-48" count={2} />
        </div>
      )}

      {/* Empty State */}
      {!loading && addresses.length === 0 && (
        <div className="text-center py-16 px-4 bg-gray-50 dark:bg-gray-800/40 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-[#FF4F5A] mx-auto flex items-center justify-center text-3xl mb-4">
            <FiMapPin />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">No Saved Addresses</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mx-auto mb-6">
            You haven't added any delivery addresses yet. Add your home or office address using Google Maps for faster checkout.
          </p>
          <button
            type="button"
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 gradient-bg text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-glow transition-smooth cursor-pointer"
          >
            <FiPlus className="text-base" />
            <span>Add Address Now</span>
          </button>
        </div>
      )}

      {/* Address Grid */}
      {!loading && addresses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleOpenEditModal}
              onDelete={(addr) => setDeletingAddress(addr)}
              onSetDefault={setDefaultAddress}
              loading={actionLoading}
            />
          ))}
        </div>
      )}

      {/* Map Address Modal */}
      <AddressMapModal
        isOpen={isMapModalOpen}
        onClose={() => setIsMapModalOpen(false)}
        onSaveAddress={handleSaveModalAddress}
        editingAddress={editingAddress}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmModal
        isOpen={Boolean(deletingAddress)}
        title="Delete Address?"
        message={`Are you sure you want to remove "${deletingAddress?.label || 'this address'}" (${deletingAddress?.street || deletingAddress?.formattedAddress})?`}
        confirmText="Delete"
        confirmVariant="danger"
        loading={actionLoading}
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingAddress(null)}
      />
    </div>
  )
}

