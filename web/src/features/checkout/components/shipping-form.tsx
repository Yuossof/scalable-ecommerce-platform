// features/checkout/components/shipping-form.tsx
"use client"
import React, { useState } from 'react'
import { ArrowRight, MapPin, Loader2 } from 'lucide-react'
import type { Address, AddressInput } from '@/shared/types/api'
import SavedAddressesList from './saved-addresses-list'
import NewAddressForm from './new-address-form'
import {
  createAddressService,
  deleteAddressService,
} from '@/shared/services/addresses.service'
import { ApiError } from '@/shared/lib/errors/apiError'
import { useToast } from '@/shared/hooks/use-toast'

export function toAddressInput(address: Address): AddressInput {
  return {
    full_name: address.full_name,
    phone: address.phone,
    city: address.city,
    area: address.area ?? undefined,
    street: address.street,
    building: address.building ?? undefined,
    apartment: address.apartment ?? undefined,
    notes: address.notes ?? undefined,
  }
}

interface ShippingFormProps {
  addresses: Address[]
  addressesLoading: boolean
  initialData?: AddressInput
  onAddressesChanged: () => void
  onSubmit: (data: AddressInput, address: Address) => void
}

const ShippingForm = ({
  addresses,
  addressesLoading,
  initialData,
  onAddressesChanged,
  onSubmit,
}: ShippingFormProps) => {
  const toast = useToast()
  const [selectedAddressId, setSelectedAddressId] = useState<string>("")
  const [manualNewAddress, setManualNewAddress] = useState(false)
  const [formData, setFormData] = useState<AddressInput>(
    initialData ?? {
      full_name: '',
      phone: '',
      city: '',
      area: '',
      street: '',
      building: '',
      apartment: '',
      notes: '',
    }
  )
  const [errors, setErrors] = useState<Partial<AddressInput>>({})
  const [submitting, setSubmitting] = useState(false)

  // With no saved addresses only the "add new" form makes sense; the user can
  // also opt into it manually while saved addresses exist.
  const showNewAddressForm = manualNewAddress || addresses.length === 0

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name as keyof AddressInput]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validate = (): boolean => {
    const newErrors: Partial<AddressInput> = {}
    if (!formData.full_name?.trim()) newErrors.full_name = 'Required'
    if (!formData.phone?.trim()) newErrors.phone = 'Required'
    if (!formData.city?.trim()) newErrors.city = 'Required'
    if (!formData.street?.trim()) newErrors.street = 'Required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSelectAddress = (address: Address) => {
    setSelectedAddressId(address.id)
    setManualNewAddress(false)
  }

  const handleAddNewClick = () => {
    setSelectedAddressId("")
    setManualNewAddress(true)
    setErrors({})
  }

  const handleDeleteAddress = async (id: string) => {
    try {
      await deleteAddressService(id)
      await onAddressesChanged()
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'Could not delete address')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (submitting) return

    if (showNewAddressForm) {
      if (!validate()) return

      setSubmitting(true)
      try {
        const input: AddressInput = {
          full_name: formData.full_name.trim(),
          phone: formData.phone.trim(),
          city: formData.city.trim(),
          area: formData.area?.trim() || undefined,
          street: formData.street.trim(),
          building: formData.building?.trim() || undefined,
          apartment: formData.apartment?.trim() || undefined,
          notes: formData.notes?.trim() || undefined,
        }
        const created = await createAddressService(input)
        onSubmit(input, created)
      } catch (error) {
        setErrors({})
        toast.error(error instanceof ApiError ? error.message : 'Could not save address')
      } finally {
        setSubmitting(false)
      }
    } else {
      const address = addresses.find((addr) => addr.id === selectedAddressId)
      if (address) {
        onSubmit(toAddressInput(address), address)
      }
    }
  }

  if (addressesLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8 flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 lg:p-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
          <MapPin className="w-5 h-5 text-slate-600" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Shipping Address</h2>
          <p className="text-sm text-gray-500">Where should we deliver your order?</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Saved Addresses Section */}
        {addresses.length > 0 && (
          <SavedAddressesList
            addresses={addresses}
            selectedAddressId={selectedAddressId}
            showNewAddressForm={showNewAddressForm}
            onSelectAddress={handleSelectAddress}
            onAddNewClick={handleAddNewClick}
            onDeleteAddress={handleDeleteAddress}
          />
        )}

        {/* New Address Form */}
        {showNewAddressForm && (
          <NewAddressForm
            formData={formData}
            errors={errors}
            onFormChange={handleChange}
          />
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || (!showNewAddressForm && !selectedAddressId)}
          className="w-full h-12 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl flex items-center justify-center gap-2 transition-colors mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Continue to Review
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>
      </form>
    </div>
  )
}

export default ShippingForm