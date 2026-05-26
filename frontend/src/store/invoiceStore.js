import {
    create
} from "zustand";
import axios from 'axios'

// point this at your own API
const API_URL =
    import.meta.env.MODE === 'development' ?
    'http://localhost:3000/api/invoice' :
    '/api/invoice'

export const useInvoiceStore = create((set) => ({
    // state
    invoiceCount: 0,
    isLoading: false,
    error: null,

    // actions
    fetchInvoiceCount: async (userId) => {
        set({
            isLoading: false,
            invoiceCount: 0,
            error: null
        });
    },

    setInvoiceCount: (count) => {
        set({
            invoiceCount: count
        })
    },

    incrementInvoiceCount: () => {
        set((state) => ({
            invoiceCount: state.invoiceCount + 1
        }))
    },
}))