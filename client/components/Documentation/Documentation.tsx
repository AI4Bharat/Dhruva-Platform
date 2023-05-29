import { OrderedList, ListItem, Code } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { dhruvaAPI } from "../../api/apiConfig";
import useMediaQuery from "../../hooks/useMediaQuery";

const Documentation = ({ ...props }) => {

  const smallscreen = useMediaQuery("(max-width: 1080px)");
  const router = useRouter();
  return (
    <>
    <OrderedList spacing={7.5} width={smallscreen?"70vw":"35vw"}>
      <ListItem>
        Set the Dhruva Inference URL in an endpoint url variable.
      </ListItem>
      <Code
        colorScheme="blackAlpha"
        padding={10}
        borderRadius={10}
        width={smallscreen ? "70vw" : "35vw"}
      >
        endpoint_url = {dhruvaAPI.genericInference}
      </Code>
      <ListItem>
        {" "}
        Modify the request payload Schema for{" "}
        {props.serviceInfo["model"]["task"]["type"].toLocaleUpperCase()} task.
      </ListItem>
      <Code
        colorScheme="blackAlpha"
        padding={10}
        borderRadius={10}
        width={smallscreen ? "70vw" : "35vw"}
      >
        {JSON.stringify({
          serviceId: router.query["serviceId"],
          input:
            props.serviceInfo.model.inferenceEndPoint["schema"]["request"][
              "input"
            ],
          config:
            props.serviceInfo.model.inferenceEndPoint["schema"]["request"][
              "config"
            ],
          audio:
            props.serviceInfo.model.inferenceEndPoint["schema"]["request"][
              "audio"
            ],
        })}
      </Code>
      <ListItem>
        Using the above payload schema make a POST request to the endpoint.
      </ListItem>
      <Code
        colorScheme="blackAlpha"
        padding={10}
        borderRadius={10}
        width={smallscreen ? "70vw" : "35vw"}
      >
        fetch(endpoint_url,
        {JSON.stringify(
          {
            method: "POST",
            body: "PAYLOAD GOES HERE",
            headers: { "Content-Type": "application/json" },
          },
          null,
          2
        )}
        )
      </Code>
      <ListItem>
        If the request is a success, the response will be in the format given
        below.
      </ListItem>
      <Code
        colorScheme="blackAlpha"
        padding={10}
        borderRadius={10}
        width={smallscreen ? "70vw" : "35vw"}
      >
        {JSON.stringify(
          props.serviceInfo.model.inferenceEndPoint["schema"]["response"],
          null,
          1
        )}
      </Code>
    </OrderedList>
    </>
  );
};

export default Documentation;
