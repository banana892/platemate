/**
 * useProfile.js — Custom Hook for Profile State & Operations
 */

import { useCallback, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { toast } from 'react-hot-toast'
import {
  fetchProfileThunk,
  updateProfileThunk,
  changePasswordThunk,
  updatePreferences as updatePreferencesAction,
  setProfile,
} from '../store/slices/profileSlice.js'
import mediaService from '../services/media.service.js'
import userService from '../services/user.service.js'

export function useProfile() {
  const dispatch = useDispatch()
  const authUser = useSelector((state) => state.auth.user)
  const { profile, preferences, loading, error } = useSelector((state) => state.profile)
  const [avatarProgress, setAvatarProgress] = useState(0)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  // Combined active user object (prefers profile slice over auth user)
  const currentUser = profile || authUser

  const fetchProfile = useCallback(async () => {
    try {
      const result = await dispatch(fetchProfileThunk()).unwrap()
      return result
    } catch (err) {
      toast.error(err || 'Failed to fetch profile')
      throw err
    }
  }, [dispatch])

  const updateProfile = async (profileData) => {
    try {
      const updated = await dispatch(updateProfileThunk(profileData)).unwrap()
      toast.success('Profile updated successfully!')
      return updated
    } catch (err) {
      toast.error(err || 'Failed to update profile')
      throw err
    }
  }

  const uploadAvatar = async (file) => {
    setUploadingAvatar(true)
    setAvatarProgress(0)

    try {
      // 1. Upload to media service
      const mediaResponse = await mediaService.uploadImage(
        file,
        'users/profile',
        (percent) => setAvatarProgress(percent)
      )

      const imageUrl = mediaResponse.url || mediaResponse.secure_url
      const publicId = mediaResponse.public_id

      // 2. Save avatar reference on user profile
      const updatedUser = await userService.updateProfileImage({
        imageUrl,
        publicId,
        avatar: imageUrl,
      })

      dispatch(setProfile(updatedUser))
      toast.success('Profile picture updated!')
      return updatedUser
    } catch (err) {
      toast.error(err.message || 'Avatar upload failed')
      throw err
    } finally {
      setUploadingAvatar(false)
      setAvatarProgress(0)
    }
  }

  const changePassword = async (passwordData) => {
    try {
      await dispatch(changePasswordThunk(passwordData)).unwrap()
      toast.success('Password changed successfully!')
    } catch (err) {
      toast.error(err || 'Password change failed')
      throw err
    }
  }

  const updatePreferences = (newPreferences) => {
    dispatch(updatePreferencesAction(newPreferences))
    toast.success('Preferences saved')
  }

  return {
    user: currentUser,
    profile,
    preferences,
    loading: loading.profile,
    updatingProfile: loading.updateProfile,
    changingPassword: loading.passwordChange,
    uploadingAvatar,
    avatarProgress,
    error: error.profile,
    fetchProfile,
    updateProfile,
    uploadAvatar,
    changePassword,
    updatePreferences,
  }
}

export default useProfile
