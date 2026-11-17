// features/checkout/components/saved-addresses-list.tsx
"use client"
import React from 'react'
import { Plus, Check, Trash2 } from 'lucide-react'
import type { Address } from '@/shared/types/api'

interface SavedAddressesListProps {
  addresses: Address[]
  selectedAddressId: string
  showNewAddressForm: boolean
  onSelectAddress: (address: Address) => void
  onAddNewClick: () => void
  onDeleteAddress: (id: string) => void
}

const SavedAddressesList = ({
  addresses,
  selectedAddressId,
  showNewAddressForm,
  onSelectAddress,
  onAddNewClick,
  onDeleteAddress,
}: SavedAddressesListProps) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        Saved Addresses
      </label>

      <div className="grid gap-3">
        {addresses.map((address) => {
          const isSelected = selectedAddressId === address.id && !showNewAddressForm
          const buildingLabel = address.building ? `, ${address.building}` : ''
          const areaLabel = address.area ? `${address.area}, ` : ''
          const addressLine = `${address.street}${buildingLabel}, ${areaLabel}${address.city}`

          return (
            <div
              key={address.id}
              onClick={() => onSelectAddress(address)}
              className={`relative p-4 border-2 rounded-xl cursor-pointer transition-all ${isSelected
                ? 'border-slate-800 bg-slate-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
            >
              <div className="flex items-start gap-3">
                {/* Selection Indicator */}
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${isSelected ? 'border-slate-800 bg-slate-800' : 'border-gray-300'
                    }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>

                {/* Address Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">
                      {address.full_name}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {address.street}{buildingLabel}
                    {address.apartment ? `, ${address.apartment}` : ''}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{addressLine}</p>
                  <p className="text-sm text-gray-500">{address.phone}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteAddress(address.id)
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Add New Address Button */}
      <button
        type="button"
        onClick={onAddNewClick}
        className={`w-full p-4 border-2 border-dashed rounded-xl flex items-center justify-center gap-2 transition-all ${showNewAddressForm
          ? 'border-slate-800 bg-slate-50 text-slate-800'
          : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-600'
          }`}
      >
        <Plus className="w-5 h-5" />
        <span className="font-medium">Add New Address</span>
      </button>
    </div>
  )
}

export default SavedAddressesList