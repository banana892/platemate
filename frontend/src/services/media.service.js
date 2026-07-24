/**
 * media.service.js — Cloudinary Media Upload API Service
 */

import api from './api.js'

export const mediaService = {
  /**
   * Upload an image file to the media storage endpoint with progress tracking
   *
   * @param {File} file - Image file object
   * @param {string} folder - Destination folder (e.g. 'users/profile')
   * @param {Function} [onUploadProgress] - Callback for upload percentage
   */
  async uploadImage(file, folder = 'users/profile', onUploadProgress = null) {
    const formData = new FormData()
    formData.append('image', file)

    const response = await api.post(`/media/upload?folder=${encodeURIComponent(folder)}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onUploadProgress && progressEvent.total) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onUploadProgress(percentCompleted)
        }
      },
    })

    return response.data // { url, secure_url, public_id }
  },

  /**
   * Delete an asset from Cloudinary storage by publicId
   */
  async deleteImage(publicId) {
    const response = await api.delete(`/media/${encodeURIComponent(publicId)}`)
    return response.data
  },
}

export default mediaService
