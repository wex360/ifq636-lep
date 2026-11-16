// Turns an axios error into the text shown in a page's error state.
// Field errors come from the backend validate middleware (LEP-16).
export const apiError = (error, fallback) => {
  const data = error?.response?.data;
  if (data?.errors) return Object.values(data.errors).join(' ');
  return data?.message || fallback;
};
