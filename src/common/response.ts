export interface ApiResponse<T = any> {
    success: boolean;
    data: T | null;
    error: string | null;
    meta?: Record<string, any>;
}

export function successResponse<T>(data: T, meta?: Record<string, any>): ApiResponse<T> {
    return {
        success: true,
        data,
        error: null,
        meta
    };
}

export function errorResponse(error: string, meta?: Record<string, any>): ApiResponse<null> {
    return {
        success: false,
        data: null,
        error,
        meta
    };
}
