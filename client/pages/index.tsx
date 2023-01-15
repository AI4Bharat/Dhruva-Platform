import {
  Grid,
  GridItem,
  Image,
  Heading,
  Stack,
  Input,
  Button,
  useMediaQuery,
  Box,
} from "@chakra-ui/react";
import { useState } from "react";
import { useRouter } from "next/router";

export default function Login() {
  const router = useRouter();

  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const validateCredentials = () => {
    if (username === "dhruva" && password === "test@123") {
      router.push("/services");
    }
  };

  return (
    <>
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
