// todo check this
export const getErrorMessage = (error: any) => {
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  return error.message;
};
