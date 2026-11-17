import { API_ENDPOINTS } from "@/shared/lib/api/endpoints";
import { mapAddress, mapAddresses } from "@/shared/lib/api/mappers";
import { axiosInstanace } from "@/shared/lib/axios";
import { handleApiError } from "@/shared/lib/errors/handleApiError";
import type { Address, AddressInput } from "@/shared/types/api";

interface AddressesResponse {
  data: Address[];
}

interface AddressResponse {
  data: Address;
}

export const getAddressesService = async (): Promise<Address[]> => {
  try {
    const res = await axiosInstanace.get<AddressesResponse>(
      API_ENDPOINTS.ADDRESSES.GET
    );
    return mapAddresses(res.data.data);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const getAddressByIdService = async (
  addressId: string
): Promise<Address> => {
  try {
    const res = await axiosInstanace.get<AddressResponse>(
      API_ENDPOINTS.ADDRESSES.GET_ONE(addressId)
    );
    return mapAddress(res.data.data);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const createAddressService = async (
  input: AddressInput
): Promise<Address> => {
  try {
    const res = await axiosInstanace.post<AddressResponse>(
      API_ENDPOINTS.ADDRESSES.CREATE,
      input
    );
    return mapAddress(res.data.data);
  } catch (error) {
    throw handleApiError(error);
  }
};

export const updateAddressService = async (
  addressId: string,
  input: AddressInput
): Promise<Address> => {
  try {
    const res = await axiosInstanace.put<AddressResponse>(
      API_ENDPOINTS.ADDRESSES.UPDATE(addressId),
      input
    );
    return mapAddress(res.data.data);
  } catch (error) {
    throw handleApiError(error);
  }
};

/** `DELETE /addresses/:addressId` responds with an empty 204. */
export const deleteAddressService = async (addressId: string): Promise<void> => {
  try {
    await axiosInstanace.delete(API_ENDPOINTS.ADDRESSES.DELETE(addressId));
  } catch (error) {
    throw handleApiError(error);
  }
};
