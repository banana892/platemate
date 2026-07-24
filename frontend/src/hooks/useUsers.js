/**
 * useUsers.js — Custom Hook for Admin User & Role Management (Phase F4)
 */

import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import userService from '../services/user.service.js'
import {
  fetchAdminUsersThunk,
  fetchAdminRidersThunk,
  setSelectedUser,
  toggleSelectUserId,
  selectAllUserIds,
  clearSelectedUserIds,
} from '../store/slices/adminSlice.js'

export function useUsers() {
  const dispatch = useDispatch()
  const {
    users,
    riders,
    selectedUserIds,
    selectedUser,
    loading,
  } = useSelector((state) => state.admin)

  const fetchUsers = useCallback(async (params = {}) => {
    try {
      return await dispatch(fetchAdminUsersThunk(params)).unwrap()
    } catch (err) {
      toast.error(err || 'Failed to load users')
    }
  }, [dispatch])

  const fetchRiders = useCallback(async (params = {}) => {
    try {
      return await dispatch(fetchAdminRidersThunk(params)).unwrap()
    } catch (err) {
      toast.error(err || 'Failed to load riders')
    }
  }, [dispatch])

  const updateUserStatus = async (userId, status) => {
    try {
      await userService.updateUserStatus(userId, status)
      toast.success(`User status updated to ${status}`)
      fetchUsers()
    } catch (err) {
      toast.error(err.message || 'Failed to update user status')
    }
  }

  const updateUserRole = async (userId, { role, subRole }) => {
    try {
      await userService.updateUserRole(userId, { role, subRole })
      toast.success(`Updated role for user`)
      fetchUsers()
    } catch (err) {
      toast.error(err.message || 'Failed to update user role')
    }
  }

  const bulkUpdateStatus = async (status) => {
    if (selectedUserIds.length === 0) return
    try {
      await userService.bulkUpdateUserStatus(selectedUserIds, status)
      toast.success(`Bulk updated ${selectedUserIds.length} users to ${status}`)
      dispatch(clearSelectedUserIds())
      fetchUsers()
    } catch (err) {
      toast.error(err.message || 'Bulk status update failed')
    }
  }

  const selectUser = (user) => {
    dispatch(setSelectedUser(user))
  }

  const toggleSelectUser = (id) => {
    dispatch(toggleSelectUserId(id))
  }

  const selectAllUsers = (ids) => {
    dispatch(selectAllUserIds(ids))
  }

  const clearSelection = () => {
    dispatch(clearSelectedUserIds())
  }

  return {
    users,
    riders,
    selectedUserIds,
    selectedUser,
    loading: loading.users,
    fetchUsers,
    fetchRiders,
    updateUserStatus,
    updateUserRole,
    bulkUpdateStatus,
    selectUser,
    toggleSelectUser,
    selectAllUsers,
    clearSelection,
  }
}

export default useUsers
