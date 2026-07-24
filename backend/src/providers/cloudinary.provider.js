/**
 * cloudinary.provider.js — Cloudinary Media Storage Provider (Phase 12)
 *
 * Encapsulates all Cloudinary SDK interactions. Supports test mock bypasses
 * and automatic delivery optimization transformations.
 */

import { v2 as cloudinary } from 'cloudinary'
import { env } from '../config/env.js'
import logger from '../config/logger.js'

// Configure Cloudinary only if variables are available
if (env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

/**
 * Upload an image buffer directly to a specified folder on Cloudinary.
 * Bypassed in test environments unless TEST_LIVE_CLOUDINARY is defined.
 */
export const uploadImageBuffer = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    if (env.NODE_ENV === 'test' && !process.env.TEST_LIVE_CLOUDINARY) {
      const mockId = `platemate_mock_${Date.now()}_${Math.round(Math.random() * 1000)}`
      const secureUrl = `https://res.cloudinary.com/platemate-demo/image/upload/v12345/${folder}/${mockId}.png`
      
      // Auto-optimize delivery URL using replace transformations
      const optimizedUrl = getOptimizedUrl(secureUrl)

      return resolve({
        secure_url: optimizedUrl,
        public_id: `${folder}/${mockId}`,
        bytes: fileBuffer.length,
        format: 'png',
      })
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `platemate/${folder}`,
      },
      (error, result) => {
        if (error) {
          logger.error({ err: error.message }, 'Cloudinary upload stream failed')
          return reject(new Error(`Cloudinary Upload Error: ${error.message}`))
        }
        
        // Generate optimized delivery URL
        if (result && result.secure_url) {
          result.secure_url = getOptimizedUrl(result.secure_url)
        }
        
        resolve(result)
      }
    )

    uploadStream.end(fileBuffer)
  })
}

/**
 * Delete a media asset from Cloudinary using its public ID.
 * Returns successfully even if the asset was already deleted (idempotent).
 */
export const deleteImage = (publicId) => {
  return new Promise((resolve, reject) => {
    if (env.NODE_ENV === 'test' && !process.env.TEST_LIVE_CLOUDINARY) {
      logger.info({ publicId }, 'Mock deleting Cloudinary asset')
      return resolve({ result: 'ok' })
    }

    if (!publicId) {
      return resolve({ result: 'not_found' })
    }

    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        logger.error({ publicId, err: error.message }, 'Cloudinary destroy failed')
        return reject(new Error(`Cloudinary Delete Error: ${error.message}`))
      }
      logger.info({ publicId, result: result.result }, 'Cloudinary asset deletion resolved')
      resolve(result)
    })
  })
}

/**
 * Apply Cloudinary delivery optimization transformations (f_auto, q_auto).
 */
export const getOptimizedUrl = (secureUrl) => {
  if (!secureUrl) return secureUrl
  if (!secureUrl.includes('res.cloudinary.com')) return secureUrl
  return secureUrl.replace('/image/upload/', '/image/upload/f_auto,q_auto/')
}
