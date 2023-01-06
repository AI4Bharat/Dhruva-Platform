import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import {customTheme} from '../themes/index'
export default function App({ Component, pageProps }: AppProps) {
  return  (<ChakraProvider theme={customTheme}>
    <Component {...pageProps} />
  </ChakraProvider>)
}
