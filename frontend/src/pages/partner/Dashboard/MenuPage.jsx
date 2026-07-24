/**
 * MenuPage.jsx — Menu Item Management Page (/partner/menu)
 */

import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiPlus, FiGrid, FiList, FiBookOpen } from 'react-icons/fi'
import MenuCard from '../../../components/partner/MenuCard.jsx'
import MenuTable from '../../../components/partner/MenuTable.jsx'
import SearchBar from '../../../components/partner/SearchBar.jsx'
import FilterBar from '../../../components/partner/FilterBar.jsx'
import ConfirmModal from '../../../components/ui/ConfirmModal.jsx'
import Skeleton from '../../../components/ui/Skeleton.jsx'
import useMenu from '../../../hooks/useMenu.js'
import useCategories from '../../../hooks/useCategories.js'

export default function MenuPage() {
  const navigate = useNavigate()
  const { menuItems, loading, fetchMenuItems, deleteMenuItem, toggleAvailability } = useMenu()
  const { categories, fetchCategories } = useCategories()

  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [deletingItem, setDeletingItem] = useState(null)

  useEffect(() => {
    fetchMenuItems().catch(() => {})
    fetchCategories().catch(() => {})
  }, [fetchMenuItems, fetchCategories])

  // Category filter options
  const filterOptions = useMemo(() => {
    const opts = [{ label: 'All Items', value: 'ALL' }]
    categories.forEach((cat) => {
      opts.push({ label: cat.name, value: cat.id })
    })
    return opts
  }, [categories])

  // Filtered menu items
  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const itemCatId = item.categoryId || item.category?.id || item.category
      const matchesCat = selectedCategory === 'ALL' || itemCatId === selectedCategory

      return matchesSearch && matchesCat
    })
  }, [menuItems, searchQuery, selectedCategory])

  const handleConfirmDelete = async () => {
    if (!deletingItem) return
    try {
      await deleteMenuItem(deletingItem.id)
      setDeletingItem(null)
    } catch {}
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900">Menu Items</h2>
          <p className="text-sm text-gray-500">Manage dishes, pricing, availability, and food images</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View Toggles */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-smooth cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-orange-600 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Grid View"
            >
              <FiGrid className="text-base" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg transition-smooth cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-orange-600 shadow-xs' : 'text-gray-500 hover:text-gray-900'
              }`}
              title="Table View"
            >
              <FiList className="text-base" />
            </button>
          </div>

          <Link
            to="/partner/menu/new"
            className="bg-gradient-to-r from-orange-500 to-amber-500 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-glow transition-smooth flex items-center gap-2 cursor-pointer"
          >
            <FiPlus className="text-base" />
            <span>Add Menu Item</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search menu items..." />
        <FilterBar options={filterOptions} selected={selectedCategory} onSelect={setSelectedCategory} />
      </div>

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Skeleton variant="card" className="h-64" count={6} />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredItems.length === 0 && (
        <div className="text-center py-16 px-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 mx-auto flex items-center justify-center text-3xl mb-4">
            <FiBookOpen />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">No Menu Items Found</h3>
          <p className="text-sm text-gray-500 max-w-sm mx-auto mb-6">
            {searchQuery || selectedCategory !== 'ALL'
              ? 'No menu items match your search and category filters.'
              : 'You haven’t added any menu items yet. Create your first dish now!'}
          </p>
          <Link
            to="/partner/menu/new"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white px-6 py-3 rounded-xl font-bold text-sm hover:shadow-glow transition-smooth cursor-pointer"
          >
            <FiPlus />
            <span>Create Dish Item</span>
          </Link>
        </div>
      )}

      {/* Grid or Table Display */}
      {!loading && filteredItems.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <MenuCard
                  key={item.id}
                  item={item}
                  onEdit={(i) => navigate(`/partner/menu/edit/${i.id}`)}
                  onDelete={(i) => setDeletingItem(i)}
                  onToggleAvailability={toggleAvailability}
                />
              ))}
            </div>
          ) : (
            <MenuTable
              items={filteredItems}
              onEdit={(i) => navigate(`/partner/menu/edit/${i.id}`)}
              onDelete={(i) => setDeletingItem(i)}
              onToggleAvailability={toggleAvailability}
            />
          )}
        </>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingItem)}
        title="Delete Menu Item?"
        message={`Are you sure you want to delete "${deletingItem?.name}"? This action cannot be undone.`}
        confirmText="Delete Item"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
        onClose={() => setDeletingItem(null)}
      />
    </div>
  )
}
