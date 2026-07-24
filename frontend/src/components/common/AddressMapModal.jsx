/**
 * AddressMapModal.jsx — Production-Quality Google Maps Delivery Address Modal
 *
 * Features:
 * - Lazy-loaded Google Maps APIProvider & Map (@vis.gl/react-google-maps)
 * - Strict APIProvider scope: all map hooks are strictly inside APIProvider context
 * - Google Places Autocomplete restricted to India by default
 * - Browser Geolocation API ("Use Current Location") with error handling
 * - Interactive Draggable AdvancedMarker
 * - Reverse Geocoding on marker move & place selection
 * - Form validation (react-hook-form + zod) for all required address fields
 * - Address Labels (Home, Work, Other) & Default Address toggle
 * - Responsive, accessible, dark mode compatible & smooth animations
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMapsLibrary,
  useMap,
} from '@vis.gl/react-google-maps'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  FiX,
  FiMapPin,
  FiNavigation,
  FiSearch,
  FiHome,
  FiBriefcase,
  FiTag,
  FiCheck,
  FiAlertTriangle,
  FiLoader,
} from 'react-icons/fi'
import { toast } from 'react-hot-toast'

// Default fallback coordinates (Bangalore, India)
const DEFAULT_CENTER = { lat: 12.9716, lng: 77.5946 }
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

// Zod Schema for Address Form Validation
const addressFormSchema = z.object({
  label: z.enum(['Home', 'Work', 'Other']),
  recipientName: z.string().trim().min(2, 'Recipient name must be at least 2 characters'),
  phone: z
    .string()
    .trim()
    .regex(/^\+?\d{10,15}$/, 'Enter a valid 10-15 digit phone number'),
  houseNumber: z.string().trim().min(1, 'House / Flat Number is required'),
  landmark: z.string().trim().optional(),
  formattedAddress: z.string().trim().min(5, 'Street address / line is required'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{6}$/, 'Postal code must be exactly 6 digits'),
  country: z.string().trim().default('India'),
  isDefault: z.boolean().default(false),
})

/**
 * Custom Autocomplete Component — MUST BE RENDERED INSIDE APIProvider
 */
function PlacesAutocompleteInput({ onPlaceSelect, countryCode = 'in' }) {
  const [inputValue, setInputValue] = useState('')
  const [predictions, setPredictions] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const placesLibrary = useMapsLibrary('places')
  const autocompleteService = useRef(null)
  const placesService = useRef(null)
  const wrapperRef = useRef(null)

  useEffect(() => {
    if (placesLibrary && window.google && window.google.maps && window.google.maps.places) {
      try {
        autocompleteService.current = new window.google.maps.places.AutocompleteService()
        placesService.current = new window.google.maps.places.PlacesService(
          document.createElement('div')
        )
      } catch (err) {
        console.warn('Failed to initialize PlacesService:', err)
      }
    }
  }, [placesLibrary])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e) => {
    const val = e.target.value
    setInputValue(val)
    if (!val.trim()) {
      setPredictions([])
      setIsOpen(false)
      return
    }

    if (autocompleteService.current && window.google?.maps?.places) {
      setLoading(true)
      autocompleteService.current.getPlacePredictions(
        {
          input: val,
          componentRestrictions: countryCode ? { country: countryCode } : undefined,
        },
        (results, status) => {
          setLoading(false)
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            results
          ) {
            setPredictions(results)
            setIsOpen(true)
          } else {
            setPredictions([])
          }
        }
      )
    }
  }

  const handleSelectPrediction = (prediction) => {
    setInputValue(prediction.description)
    setIsOpen(false)

    if (placesService.current && window.google?.maps?.places) {
      placesService.current.getDetails(
        { placeId: prediction.place_id },
        (place, status) => {
          if (
            status === window.google.maps.places.PlacesServiceStatus.OK &&
            place &&
            place.geometry
          ) {
            onPlaceSelect(place)
          } else {
            toast.error('Could not fetch place details.')
          }
        }
      )
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-base" />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => predictions.length > 0 && setIsOpen(true)}
          placeholder="Search location (e.g. MG Road Bangalore)..."
          className="w-full pl-10 pr-10 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF4F5A] focus:border-transparent transition-smooth"
        />
        {loading && (
          <FiLoader className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#FF4F5A] animate-spin" />
        )}
      </div>

      {/* Predictions Dropdown */}
      {isOpen && predictions.length > 0 && (
        <div className="absolute z-50 left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
          {predictions.map((p) => (
            <button
              key={p.place_id}
              type="button"
              onClick={() => handleSelectPrediction(p)}
              className="w-full text-left px-4 py-3 hover:bg-rose-50/50 dark:hover:bg-gray-700/50 border-b border-gray-100 dark:border-gray-700/50 last:border-0 flex items-start gap-3 transition-colors cursor-pointer"
            >
              <FiMapPin className="text-[#FF4F5A] text-base mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">
                  {p.structured_formatting?.main_text || p.description}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {p.structured_formatting?.secondary_text || ''}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Controller Component to Programmatically Recenter Map
 */
function MapRecenter({ center }) {
  const map = useMap()
  useEffect(() => {
    if (map && center) {
      map.panTo(center)
    }
  }, [map, center])
  return null
}

/**
 * Inner Component — MUST BE RENDERED INSIDE APIProvider
 */
function AddressMapModalContent({
  onClose,
  onSaveAddress,
  editingAddress = null,
}) {
  const [markerPosition, setMarkerPosition] = useState(DEFAULT_CENTER)
  const [isLocating, setIsLocating] = useState(false)
  const [geocodedAddress, setGeocodedAddress] = useState('')

  const geocoderRef = useRef(null)
  const geocodingLibrary = useMapsLibrary('geocoding')

  // Setup Form
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      label: 'Home',
      recipientName: '',
      phone: '',
      houseNumber: '',
      landmark: '',
      formattedAddress: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      isDefault: false,
    },
  })

  const currentLabel = watch('label')

  // Initialize Geocoder safely when library is ready
  useEffect(() => {
    if (geocodingLibrary && window.google && window.google.maps) {
      try {
        geocoderRef.current = new window.google.maps.Geocoder()
      } catch (err) {
        console.warn('Failed to initialize Geocoder:', err)
      }
    }
  }, [geocodingLibrary])

  // Reverse Geocoding Function
  const reverseGeocode = useCallback((lat, lng) => {
    if (!geocoderRef.current && window.google && window.google.maps) {
      try {
        geocoderRef.current = new window.google.maps.Geocoder()
      } catch (_err) {}
    }
    if (!geocoderRef.current) return

    geocoderRef.current.geocode(
      { location: { lat, lng } },
      (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const res = results[0]
          const addressText = res.formatted_address
          setGeocodedAddress(addressText)
          setValue('formattedAddress', addressText, { shouldValidate: true })

          let city = ''
          let state = ''
          let country = 'India'
          let postalCode = ''

          res.address_components.forEach((comp) => {
            if (
              comp.types.includes('locality') ||
              comp.types.includes('administrative_area_level_3') ||
              comp.types.includes('sublocality_level_1')
            ) {
              if (!city) city = comp.long_name
            }
            if (comp.types.includes('administrative_area_level_1')) {
              state = comp.long_name
            }
            if (comp.types.includes('country')) {
              country = comp.long_name
            }
            if (comp.types.includes('postal_code')) {
              postalCode = comp.long_name
            }
          })

          if (city) setValue('city', city, { shouldValidate: true })
          if (state) setValue('state', state, { shouldValidate: true })
          if (country) setValue('country', country, { shouldValidate: true })
          if (postalCode && /^\d{6}$/.test(postalCode)) {
            setValue('postalCode', postalCode, { shouldValidate: true })
          }
        }
      }
    )
  }, [setValue])

  // Synchronize modal state on mount or edit change
  useEffect(() => {
    if (editingAddress) {
      const lat = Number(editingAddress.latitude) || DEFAULT_CENTER.lat
      const lng = Number(editingAddress.longitude) || DEFAULT_CENTER.lng
      setMarkerPosition({ lat, lng })
      reset({
        label: editingAddress.label || 'Home',
        recipientName: editingAddress.recipientName || '',
        phone: editingAddress.phone || '',
        houseNumber: editingAddress.houseNumber || '',
        landmark: editingAddress.landmark || '',
        formattedAddress: editingAddress.formattedAddress || editingAddress.street || '',
        city: editingAddress.city || '',
        state: editingAddress.state || '',
        postalCode: editingAddress.postalCode || '',
        country: editingAddress.country || 'India',
        isDefault: Boolean(editingAddress.isDefault),
      })
      setGeocodedAddress(editingAddress.formattedAddress || editingAddress.street || '')
    } else {
      setMarkerPosition(DEFAULT_CENTER)
      reset({
        label: 'Home',
        recipientName: '',
        phone: '',
        houseNumber: '',
        landmark: '',
        formattedAddress: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
        isDefault: false,
      })
      setGeocodedAddress('')
    }
  }, [editingAddress, reset])

  const handleMarkerDragEnd = (e) => {
    if (e.latLng) {
      const lat = e.latLng.lat()
      const lng = e.latLng.lng()
      setMarkerPosition({ lat, lng })
      reverseGeocode(lat, lng)
    }
  }

  const handlePlaceSelect = (place) => {
    if (place.geometry && place.geometry.location) {
      const lat = place.geometry.location.lat()
      const lng = place.geometry.location.lng()
      setMarkerPosition({ lat, lng })
      reverseGeocode(lat, lng)
    }
  }

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.')
      return
    }

    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude
        const lng = pos.coords.longitude
        setMarkerPosition({ lat, lng })
        reverseGeocode(lat, lng)
        setIsLocating(false)
        toast.success('Location updated!')
      },
      (err) => {
        setIsLocating(false)
        if (err.code === err.PERMISSION_DENIED) {
          toast.error('Location permission denied. Please allow location access in browser.')
        } else if (err.code === err.TIMEOUT) {
          toast.error('Location request timed out.')
        } else {
          toast.error('Unable to retrieve location.')
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const onSubmit = async (data) => {
    const payload = {
      ...data,
      latitude: Number(markerPosition.lat),
      longitude: Number(markerPosition.lng),
      street: data.formattedAddress,
    }

    try {
      await onSaveAddress(payload)
      onClose()
    } catch (_err) {}
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[80vh] overflow-y-auto">
      {/* Left Column: Map & Search */}
      <div className="lg:col-span-7 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 flex flex-col gap-4 border-r border-gray-100 dark:border-gray-800">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex-1">
              <PlacesAutocompleteInput
                onPlaceSelect={handlePlaceSelect}
                countryCode="in"
              />
            </div>
            <button
              type="button"
              onClick={handleUseCurrentLocation}
              disabled={isLocating}
              className="px-3.5 py-2.5 gradient-bg text-white rounded-xl text-xs font-bold flex items-center gap-1.5 hover:shadow-glow transition-smooth flex-shrink-0 disabled:opacity-50 cursor-pointer"
              title="Use Current Location"
            >
              {isLocating ? (
                <FiLoader className="animate-spin text-sm" />
              ) : (
                <FiNavigation className="text-sm" />
              )}
              <span className="hidden sm:inline">Current Location</span>
            </button>
          </div>

          {/* Map View */}
          <div className="relative w-full h-[280px] sm:h-[340px] rounded-2xl overflow-hidden shadow-inner border border-gray-200 dark:border-gray-700">
            {mapError ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 p-4 text-center">
                <FiAlertTriangle className="text-3xl text-rose-500 mb-2" />
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                  {mapError}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  You can manually enter your address in the form on the right.
                </p>
              </div>
            ) : (
              <Map
                defaultCenter={markerPosition}
                center={markerPosition}
                defaultZoom={15}
                mapId="PLATEMATE_MAP_MODAL"
                gestureHandling="greedy"
                disableDefaultUI={false}
                className="w-full h-full"
              >
                <MapRecenter center={markerPosition} />
                <AdvancedMarker
                  position={markerPosition}
                  draggable={true}
                  onDragEnd={handleMarkerDragEnd}
                />
              </Map>
            )}
          </div>
        </div>

        {geocodedAddress && (
          <div className="p-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs">
            <p className="text-gray-400 font-medium">Selected Location Preview:</p>
            <p className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 leading-relaxed">
              {geocodedAddress}
            </p>
            <p className="text-[10px] text-gray-400 mt-1">
              Lat: {markerPosition.lat.toFixed(6)}, Lng: {markerPosition.lng.toFixed(6)}
            </p>
          </div>
        )}
      </div>

      {/* Right Column: Address Details Form */}
      <div className="lg:col-span-5 p-4 sm:p-6 bg-white dark:bg-gray-900 flex flex-col">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex-1 flex flex-col justify-between">
          <div className="space-y-3.5">
            {/* Tag / Label */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
                Address Tag
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'Home', icon: FiHome },
                  { id: 'Work', icon: FiBriefcase },
                  { id: 'Other', icon: FiTag },
                ].map((item) => {
                  const Icon = item.icon
                  const isSelected = currentLabel === item.id
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setValue('label', item.id, { shouldValidate: true })}
                      className={`flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold border transition-smooth cursor-pointer ${
                        isSelected
                          ? 'border-[#FF4F5A] bg-rose-50/60 dark:bg-rose-950/40 text-[#FF4F5A]'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 text-gray-600 dark:text-gray-400'
                      }`}
                    >
                      <Icon className="text-sm" />
                      {item.id}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Recipient Name & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  {...register('recipientName')}
                  placeholder="John Doe"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]"
                />
                {errors.recipientName && (
                  <p className="text-[10px] text-rose-500 mt-0.5">{errors.recipientName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  {...register('phone')}
                  placeholder="9876543210"
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]"
                />
                {errors.phone && (
                  <p className="text-[10px] text-rose-500 mt-0.5">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* House / Flat Number */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                House / Flat / Building No *
              </label>
              <input
                type="text"
                {...register('houseNumber')}
                placeholder="Flat 402, Sunshine Apartments"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]"
              />
              {errors.houseNumber && (
                <p className="text-[10px] text-rose-500 mt-0.5">{errors.houseNumber.message}</p>
              )}
            </div>

            {/* Street / Formatted Address Line */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Street / Area Address Line *
              </label>
              <input
                type="text"
                {...register('formattedAddress')}
                placeholder="12th Main Road, Indiranagar"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]"
              />
              {errors.formattedAddress && (
                <p className="text-[10px] text-rose-500 mt-0.5">{errors.formattedAddress.message}</p>
              )}
            </div>

            {/* Landmark */}
            <div>
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                Landmark (Optional)
              </label>
              <input
                type="text"
                {...register('landmark')}
                placeholder="Near Metro Station"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]"
              />
            </div>

            {/* City, State, Postal Code */}
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  City *
                </label>
                <input
                  type="text"
                  {...register('city')}
                  placeholder="Bengaluru"
                  className="w-full px-2.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  State *
                </label>
                <input
                  type="text"
                  {...register('state')}
                  placeholder="Karnataka"
                  className="w-full px-2.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Pincode *
                </label>
                <input
                  type="text"
                  {...register('postalCode')}
                  placeholder="560038"
                  className="w-full px-2.5 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-xs font-medium text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#FF4F5A]"
                />
              </div>
            </div>

            {/* Make Default Address Checkbox */}
            <label className="flex items-center gap-2 pt-1 cursor-pointer">
              <input
                type="checkbox"
                {...register('isDefault')}
                className="w-4 h-4 text-[#FF4F5A] rounded border-gray-300 focus:ring-[#FF4F5A]"
              />
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                Set as Default Address
              </span>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-xs font-bold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-smooth"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 gradient-bg text-white text-xs font-bold rounded-xl hover:shadow-glow transition-smooth flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <FiLoader className="animate-spin text-sm" />
              ) : (
                <FiCheck className="text-sm" />
              )}
              {editingAddress ? 'Update Address' : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/**
 * Top-Level Export — Manages Scope & APIProvider Wrapper
 */
export default function AddressMapModal({
  isOpen,
  onClose,
  onSaveAddress,
  editingAddress = null,
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-[#FF4F5A] flex items-center justify-center font-bold">
              <FiMapPin className="text-xl" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                {editingAddress ? 'Edit Delivery Address' : 'Add Delivery Address'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Select your precise location on Google Maps
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-smooth"
            aria-label="Close Modal"
          >
            <FiX className="text-xl" />
          </button>
        </div>

        {/* Body wrapped inside APIProvider */}
        {GOOGLE_MAPS_API_KEY ? (
          <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
            <AddressMapModalContent
              onClose={onClose}
              onSaveAddress={onSaveAddress}
              editingAddress={editingAddress}
            />
          </APIProvider>
        ) : (
          <AddressMapModalContent
            onClose={onClose}
            onSaveAddress={onSaveAddress}
            editingAddress={editingAddress}
          />
        )}
      </div>
    </div>
  )
}
