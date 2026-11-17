// features/checkout/components/new-address-form.tsx
"use client"
import React from 'react'
import type { AddressInput } from '@/shared/types/api'

interface NewAddressFormProps {
  formData: AddressInput
  errors: Partial<AddressInput>
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
}

const inputClass = (hasError?: string) =>
  `w-full h-11 px-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 transition-all ${
    hasError ? 'border-red-300' : 'border-gray-200'
  }`

const NewAddressForm = ({
  formData,
  errors,
  onFormChange,
}: NewAddressFormProps) => {
  return (
    <div className="space-y-5">
      <h3 className="font-semibold text-gray-900">New Address Details</h3>

      {/* Full name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Full name
        </label>
        <input
          type="text"
          name="full_name"
          value={formData.full_name ?? ''}
          onChange={onFormChange}
          className={inputClass(errors.full_name)}
          placeholder="John Doe"
        />
        {errors.full_name && (
          <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>
        )}
      </div>

      {/* Phone + City */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Phone
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone ?? ''}
            onChange={onFormChange}
            className={inputClass(errors.phone)}
            placeholder="+1 (555) 000-0000"
          />
          {errors.phone && (
            <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            City
          </label>
          <input
            type="text"
            name="city"
            value={formData.city ?? ''}
            onChange={onFormChange}
            className={inputClass(errors.city)}
            placeholder="New York"
          />
          {errors.city && (
            <p className="text-red-500 text-xs mt-1">{errors.city}</p>
          )}
        </div>
      </div>

      {/* Street + Area */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Street
          </label>
          <input
            type="text"
            name="street"
            value={formData.street ?? ''}
            onChange={onFormChange}
            className={inputClass(errors.street)}
            placeholder="123 Main Street"
          />
          {errors.street && (
            <p className="text-red-500 text-xs mt-1">{errors.street}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Area <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            name="area"
            value={formData.area ?? ''}
            onChange={onFormChange}
            className="w-full h-11 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            placeholder="Downtown"
          />
        </div>
      </div>

      {/* Building + Apartment */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Building <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            name="building"
            value={formData.building ?? ''}
            onChange={onFormChange}
            className="w-full h-11 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            placeholder="Apt 4B"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Apartment <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            type="text"
            name="apartment"
            value={formData.apartment ?? ''}
            onChange={onFormChange}
            className="w-full h-11 px-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500"
            placeholder="Unit 12"
          />
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          Delivery notes <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          name="notes"
          value={formData.notes ?? ''}
          onChange={onFormChange}
          rows={2}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-500 resize-none"
          placeholder="Leave at the front desk"
        />
      </div>
    </div>
  )
}

export default NewAddressForm