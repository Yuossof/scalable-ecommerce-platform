/* eslint-disable react-hooks/exhaustive-deps */
"use client"
import React, { useEffect } from 'react'

import LinkButton from '@/shared/components/link-button-client-cmp'
import { useDispatch, useSelector } from 'react-redux'
import { fetchCategories } from '@/store/slices/shop-category-slice'
import { AppDispatch, RootState } from '@/store'
import { useToast } from '@/shared/hooks/use-toast'

const Categories = () => {
    const toast = useToast()
    const dispatch = useDispatch<AppDispatch>()
    const { items, loading, error } = useSelector(
        (state: RootState) => state.categories
    )

    useEffect(() => {
        dispatch(fetchCategories())
    }, [dispatch])


    useEffect(() => {
        if (error) {
            toast.error(error)
        }
    }, [error])

    return (
        <div className="mt-6 bg-white rounded-2xl p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900">Shop by Category</h3>
                <LinkButton href="/shop" className="text-sm text-primary font-medium hover:underline">
                    View All
                </LinkButton>
            </div>
            {loading ? (
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
                    {Array.from(Array(8)).map((_, i) => (
                        <div
                            key={i}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl"
                        >
                            <div className='bg-slate-200 rounded-lg w-full py-11'></div>
                            <span className="bg-slate-200 rounded-lg py-2 w-full">

                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">

                    {items.map((cat) => (
                        <LinkButton
                            key={cat.id}
                            href={`/shop?category=${cat.slug}`}
                            className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 transition-colors group"
                        >
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-lg bg-primary-light flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="text-primary text-2xl font-black uppercase">
                                    {cat.name.charAt(0)}
                                </span>
                            </div>

                            <span className="text-xs sm:text-sm font-medium text-gray-600 text-center">
                                {cat.name}
                            </span>
                        </LinkButton>
                    ))}

                    {items.length === 0 && (
                        <p className="col-span-full text-sm text-gray-500">
                            No categories available yet.
                        </p>
                    )}
                </div>
            )}

        </div>
    )
}

export default Categories
