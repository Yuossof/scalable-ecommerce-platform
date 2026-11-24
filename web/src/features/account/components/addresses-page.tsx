"use client";

import Link from "next/link";
import { useState } from "react";
import { Edit2, MapPin, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useAddresses } from "@/features/checkout/hooks/use-addresses";
import NewAddressForm from "@/features/checkout/components/new-address-form";
import {
  createAddressService,
  deleteAddressService,
  updateAddressService,
} from "@/shared/services/addresses.service";
import { useToast } from "@/shared/hooks/use-toast";
import { ApiError } from "@/shared/lib/errors/apiError";
import type { Address, AddressInput } from "@/shared/types/api";

const emptyForm: AddressInput = {
  full_name: "",
  phone: "",
  city: "",
  area: "",
  street: "",
  building: "",
  apartment: "",
  notes: "",
};

function validate(input: AddressInput): Partial<AddressInput> {
  const errors: Partial<AddressInput> = {};
  if (!input.full_name?.trim()) errors.full_name = "Full name is required";
  if (!input.phone?.trim()) errors.phone = "Phone is required";
  if (!input.city?.trim()) errors.city = "City is required";
  if (!input.street?.trim()) errors.street = "Street is required";
  return errors;
}

const AddressesPage = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { addresses, isLoading, isError, refreshAddresses } = useAddresses(
    isAuthenticated
  );
  const toast = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<AddressInput>(emptyForm);
  const [errors, setErrors] = useState<Partial<AddressInput>>({});
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const startCreate = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setErrors({});
    setShowForm(true);
  };

  const startEdit = (address: Address) => {
    setEditingId(address.id);
    setFormData({
      full_name: address.full_name,
      phone: address.phone,
      city: address.city,
      area: address.area ?? "",
      street: address.street,
      building: address.building ?? "",
      apartment: address.apartment ?? "",
      notes: address.notes ?? "",
    });
    setErrors({});
    setShowForm(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const validationErrors = validate(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const input: AddressInput = {
      full_name: formData.full_name!.trim(),
      phone: formData.phone!.trim(),
      city: formData.city!.trim(),
      street: formData.street!.trim(),
      area: formData.area?.trim() || undefined,
      building: formData.building?.trim() || undefined,
      apartment: formData.apartment?.trim() || undefined,
      notes: formData.notes?.trim() || undefined,
    };

    setSubmitting(true);
    try {
      if (editingId) {
        await updateAddressService(editingId, input);
        toast.success("Address updated");
      } else {
        await createAddressService(input);
        toast.success("Address saved");
      }
      await refreshAddresses();
      setShowForm(false);
      setEditingId(null);
      setFormData(emptyForm);
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not save address"
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (addressId: string) => {
    if (!window.confirm("Delete this address?")) return;
    setDeletingId(addressId);
    try {
      await deleteAddressService(addressId);
      toast.success("Address deleted");
      await refreshAddresses();
    } catch (error) {
      toast.error(
        error instanceof ApiError ? error.message : "Could not delete address"
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-slate-800 rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-2xl border border-border-primary p-10 text-center">
        <h1 className="text-xl font-bold text-text-primary mb-2">
          Sign in to manage addresses
        </h1>
        <p className="text-text-secondary text-sm mb-8">
          Saved addresses are private to your account.
        </p>
        <Link
          href="/auth/login?redirect=/account/addresses"
          className="inline-flex items-center justify-center bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
            <MapPin className="w-5 h-5 text-slate-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Addresses</h1>
            <p className="text-sm text-text-secondary">
              Manage your saved delivery addresses
            </p>
          </div>
        </div>
        {!showForm && (
          <button
            type="button"
            onClick={startCreate}
            className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add address
          </button>
        )}
      </div>

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="h-40 bg-bg-secondary rounded-2xl animate-pulse"
            />
          ))}
        </div>
      )}

      {!isLoading && isError && (
        <div className="bg-white rounded-2xl border border-red-200 p-10 text-center">
          <p className="text-red-600 mb-4">
            Could not load your addresses. Please try again.
          </p>
          <button
            type="button"
            onClick={() => void refreshAddresses()}
            className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors"
          >
            Try again
          </button>
        </div>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-border-primary p-6 lg:p-8 mb-6"
        >
          <h2 className="text-lg font-bold text-text-primary mb-6">
            {editingId ? "Edit address" : "New address"}
          </h2>
          <NewAddressForm
            formData={formData}
            errors={errors}
            onFormChange={handleChange}
          />
          <div className="flex flex-wrap gap-3 mt-8">
            <button
              type="submit"
              disabled={submitting}
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-6 py-3 rounded-xl transition-colors disabled:opacity-60"
            >
              {submitting ? "Saving…" : editingId ? "Update address" : "Save address"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="bg-bg-secondary hover:bg-border-tertiary text-text-primary font-medium px-6 py-3 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!isLoading && !isError && addresses.length === 0 && !showForm && (
        <div className="bg-white rounded-2xl border border-border-primary p-10 text-center">
          <div className="mx-auto w-14 h-14 rounded-full bg-slate-100 flex items-center justify-center mb-5">
            <MapPin className="w-7 h-7 text-slate-600" />
          </div>
          <h2 className="text-xl font-bold text-text-primary mb-2">
            No saved addresses
          </h2>
          <p className="text-text-secondary text-sm mb-8">
            Add an address to speed up checkout next time.
          </p>
          <button
            type="button"
            onClick={startCreate}
            className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            Add your first address
          </button>
        </div>
      )}

      {!isLoading && !isError && addresses.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <div
              key={address.id}
              className="bg-white rounded-2xl border border-border-primary p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-text-primary">
                    {address.full_name}
                  </p>
                  <p className="text-sm text-text-secondary mt-1">
                    {address.phone}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(address)}
                    aria-label="Edit address"
                    className="p-2 text-text-muted hover:text-slate-800 hover:bg-bg-secondary rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleDelete(address.id)}
                    disabled={deletingId === address.id}
                    aria-label="Delete address"
                    className="p-2 text-text-muted hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-sm text-text-secondary mt-4 leading-relaxed">
                {address.street}
                {address.building ? `, ${address.building}` : ""}
                {address.apartment ? `, ${address.apartment}` : ""}
                <br />
                {address.area ? `${address.area}, ` : ""}
                {address.city}
              </p>
              {address.notes && (
                <p className="text-xs text-text-muted mt-3 italic">
                  “{address.notes}”
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressesPage;
