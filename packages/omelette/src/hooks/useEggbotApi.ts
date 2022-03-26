import axios, { AxiosRequestConfig } from 'axios';
import { makeUseAxios } from 'axios-hooks';
import { useEffect, useState } from 'react';

const EggbotApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_ENDPOINT + "/v1"
})

const useEggbotApi = makeUseAxios({
  cache: false,
  axios: EggbotApi, 
  defaultOptions: {
    ssr: false,  
  }
})

export default useEggbotApi;
export { EggbotApi }