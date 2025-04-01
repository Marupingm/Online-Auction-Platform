import { apiSlice } from './apiSlice';

export const bidsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createBid: builder.mutation({
      query: (data) => ({
        url: '/bids',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Bid', 'Auction'],
    }),
    getAuctionBids: builder.query({
      query: (id) => ({
        url: `/bids/auction/${id}`,
      }),
      providesTags: ['Bid'],
    }),
    getMyBids: builder.query({
      query: () => ({
        url: '/bids/mybids',
      }),
      providesTags: ['Bid'],
    }),
    getMyWinningBids: builder.query({
      query: () => ({
        url: '/bids/mywins',
      }),
      providesTags: ['Bid'],
    }),
  }),
});

export const {
  useCreateBidMutation,
  useGetAuctionBidsQuery,
  useGetMyBidsQuery,
  useGetMyWinningBidsQuery,
} = bidsApiSlice; 