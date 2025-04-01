import { apiSlice } from './apiSlice';

export const auctionsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAuctions: builder.query({
      query: ({ keyword = '', pageNumber = 1, category = '', status = '' }) => ({
        url: '/auctions',
        params: { keyword, pageNumber, category, status },
      }),
      providesTags: ['Auction'],
      keepUnusedDataFor: 5,
    }),
    getAuctionDetails: builder.query({
      query: (id) => ({
        url: `/auctions/${id}`,
      }),
      providesTags: ['Auction'],
    }),
    createAuction: builder.mutation({
      query: (data) => ({
        url: '/auctions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Auction'],
    }),
    updateAuction: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/auctions/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['Auction'],
    }),
    deleteAuction: builder.mutation({
      query: (id) => ({
        url: `/auctions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Auction'],
    }),
    getMyAuctions: builder.query({
      query: () => ({
        url: '/auctions/user/myauctions',
      }),
      providesTags: ['Auction'],
    }),
    endAuction: builder.mutation({
      query: (id) => ({
        url: `/auctions/${id}/end`,
        method: 'PUT',
      }),
      invalidatesTags: ['Auction'],
    }),
  }),
});

export const {
  useGetAuctionsQuery,
  useGetAuctionDetailsQuery,
  useCreateAuctionMutation,
  useUpdateAuctionMutation,
  useDeleteAuctionMutation,
  useGetMyAuctionsQuery,
  useEndAuctionMutation,
} = auctionsApiSlice; 