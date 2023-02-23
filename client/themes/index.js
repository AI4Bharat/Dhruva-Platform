import {
    extendTheme,
    withDefaultColorScheme,
    theme as baseTheme,
  } from "@chakra-ui/react";
  import { Input } from "./components/input.theme";
  import { mode } from "@chakra-ui/theme-tools";
  import { Button } from "./components/button.theme";
  import { Container } from "./components/container.theme";
  import { Select } from "./components/select.theme";
  import { Modal } from "./components/modal.theme";

  export const customTheme = extendTheme(
    {
      colors: {
       
        border: "orange.300",
        dark: {
          100: "#303030",
          200: "#202020",
        },
        light: {
          100: "#FFFFFF",
          200: "#F8F9FB",
        },
      },
      styles: {
        global: (props) => ({
          body: {
            bg: mode("#f8f9fb", "#202020")(props),
          },
          '*::placeholder': {
            color: mode('gray.400', 'whiteAlpha.400')(props),
          },
        }),
      },
      components: {
        Input,
        Button,
        Container,
        Select,
        Modal
      },
    },
    withDefaultColorScheme({ colorScheme: "orange" })
  );
  