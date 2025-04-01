import { apiSlice } from './apiSlice';
const NOTIFICATIONS_URL = '/api/notifications';

export const notificationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query({
      query: ({ pageNumber = 1, limit = 10, keyword = '', notificationType = '' }) => ({
        url: NOTIFICATIONS_URL,
        params: { 
          pageNumber, 
          limit, 
          keyword, 
          type: notificationType 
        },
      }),
      keepUnusedDataFor: 5,
      providesTags: ['Notification'],
    }),
    
    markNotificationRead: builder.mutation({
      query: (id) => ({
        url: `${NOTIFICATIONS_URL}/${id}/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
    
    markAllNotificationsRead: builder.mutation({
      query: () => ({
        url: `${NOTIFICATIONS_URL}/read-all`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notification'],
    }),
    
    deleteNotification: builder.mutation({
      query: (id) => ({
        url: `${NOTIFICATIONS_URL}/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
    
    deleteAllNotifications: builder.mutation({
      query: () => ({
        url: NOTIFICATIONS_URL,
        method: 'DELETE',
      }),
      invalidatesTags: ['Notification'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
  useDeleteAllNotificationsMutation,
} = notificationsApiSlice; 