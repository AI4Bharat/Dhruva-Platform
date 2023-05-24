import {
  Grid,
  GridItem,
  Image,
  Heading,
  Stack,
  Input,
  Button,
  useMediaQuery,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { login } from "../api/authAPI";
import { useMutation } from "@tanstack/react-query";

export default function Login() {
  const router = useRouter();
  const toast = useToast();
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const mutation = useMutation(login);

  useEffect(() => {
    if (
      localStorage.getItem("refresh_token") &&
      localStorage.getItem("access_token")
    ) {
      if (localStorage.getItem("currentpage")) 
      {
        router.push(localStorage.getItem("current_page"));
      } 
      else 
      {
        router.push("/services");
      }
    }
  }, []);

  const validateCredentials = () => {
    mutation.mutate(
      { email: username, password: password },
      {
        onSuccess: (data) => {
          localStorage.setItem("email", username);
          if (localStorage.getItem("current_page")) 
          {
            router.push(localStorage.getItem("current_page"))
          } 
          else 
          {
            router.push("/services");
          }
        },
        onError: (error: any) => {
          if (
            error?.response.status === 401 ||
            error?.response.status === 422
          ) {
            toast({
              title: "Error",
              description: "Invalid Credentials",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          } else {
            toast({
              title: "Error",
              description: "Something went wrong, please try again later",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
          }
        },
      }
    );
  };

  // const validateCredentials = async () => {
  //   try {
  //     await login(username, password);
  //     localStorage.setItem("email", username);
  //     if(localStorage.getItem("current_page"))
  //     {
  //       router.push(localStorage.getItem("current_page"))
  //     }
  //     else
  //     {
  //       router.push(localStorage.getItem("/services"))
  //     }
  //   } catch (error) {
  //     if(error.response)
  //     {
  //     if (error.response.status === 401 || error.response.status === 422) {
  //       toast({
  //         title: "Error",
  //         description: "Invalid Credentials",
  //         status: "error",
  //         duration: 5000,
  //         isClosable: true,
  //       });
  //     } else {
  //       toast({
  //         title: "Error",
  //         description: "Something went wrong, please try again later",
  //         status: "error",
  //         duration: 5000,
  //         isClosable: true,
  //       });
  //     }
  //   }
  //  }
  // };

  return (
    <>
      <Head>
        <title>Login into Dhruva</title>
      </Head>
      {isMobile ? (
        <Grid templateColumns="repeat(1, 1fr)">
          <GridItem className="centered-column" w="100%" h="100vh">
            <Stack spacing={5}>
              <Image src="/a4b.svg" width={104} height={104} alt="a4b" />
              <Heading>Login into Dhruva</Heading>
              <Input
                value={username}
                type="username"
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                placeholder="Username"
                size="lg"
              />
              <Input
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                type="password"
                placeholder="Password"
                size="lg"
              />
              <Button
                onClick={() => {
                  validateCredentials();
                }}
              >
                LOGIN
              </Button>
            </Stack>
          </GridItem>
        </Grid>
      ) : (
        <Grid templateColumns="repeat(2, 1fr)">
          <GridItem
            className="centered-column"
            w="100%"
            h="100vh"
            bg="gray.100"
          >
            <Image
              src="/dhruvaai.svg"
              width={500}
              height={500}
              alt="dhruvabot"
            />
          </GridItem>
          <GridItem className="centered-column" w="100%" h="100vh">
            <Stack spacing={5}>
              <Image src="/a4b.svg" width={104} height={104} alt="a4b" />
              <Heading>Login into Dhruva</Heading>
              <Input
                value={username}
                type="username"
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
                placeholder="Username"
                size="lg"
              />
              <Input
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
                type="password"
                placeholder="Password"
                size="lg"
              />
              <Button
                onClick={() => {
                  validateCredentials();
                }}
              >
                LOGIN
              </Button>
            </Stack>
          </GridItem>
        </Grid>
      )}
    </>
  );
}
