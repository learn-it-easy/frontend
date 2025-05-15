import axios, { AxiosError } from 'axios';
import { ApiErrorResponse } from '../types/auth';

interface PictureRequest {
  query: string;
  max_results: number;
}

interface PictureResponse {
  pictures: {
    url: string;
  }[];
}

const API_URL = process.env.REACT_APP_API_PICTURES_URL;

export const pictureApi = {
  async getPictures(query: string, maxResults: number = 5): Promise<PictureResponse> {
    try {
      const response = await axios.post<PictureResponse>(
        `${API_URL}`,
        {
          query,
          max_results: maxResults
        } as PictureRequest,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (err) {
      const axiosError = err as AxiosError<ApiErrorResponse>;
      throw new Error(axiosError.response?.data?.message);
    }
  },
};