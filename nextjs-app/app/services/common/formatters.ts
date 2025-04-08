// todo check this
export const getErrorMessage = (error: any) => {
  if (error?.response?.data?.error) {
    return error.response.data.error;
  }
  return error.message;
};

export const truncateString = (str: string, first: number, last: number): string => {
  if (str.length <= first + last) {
    return str;
  }
  return `${str.slice(0, first)}...${str.slice(-last)}`;
};

// Convert data to string depending on its type.
export const dataToString = (data: any) => {
  if (data === undefined || data === null) return "";
  let str: string;
  if (typeof data === "string") {
    str = data;
  } else {
    try {
      str = JSON.stringify(data);
    } catch (e) {
      str = String(data);
    }
  }

  return str;
};
