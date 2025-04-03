export interface PrimitiveServiceResponse {
  success: boolean;
  message?: string;
}

export interface ServiceResponse<T> extends PrimitiveServiceResponse {
  data?: T;
}
