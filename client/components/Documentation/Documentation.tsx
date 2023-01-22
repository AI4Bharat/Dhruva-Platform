import { OrderedList, ListItem } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { dhruvaConfig } from "../../config/config";

const Documentation = ({ ...props }) => {
  const router = useRouter();
  return (
    <OrderedList spacing={7.5}>
      <ListItem>
        Set the Dhruva Inference URL in an endpoint url variable.
      </ListItem>
      <pre
        style={{
          backgroundColor: "#f5f5f5",
          padding: 10,
          borderRadius: 15,
          width: "60vw",
          maxWidth: 400,
          whiteSpace: "initial",
        }}
      >
        endpoint_url = {dhruvaConfig.genericInference}
      </pre>
      <ListItem>
        {" "}
        Modify the request payload Schema for{" "}
        {props.serviceInfo["model"]["task"]["type"].toLocaleUpperCase()} task.
      </ListItem>
      <pre
        style={{
          backgroundColor: "#f5f5f5",
          padding: 10,
          borderRadius: 15,
          width: "60vw",
          maxWidth: 400,
          whiteSpace: "initial",
        }}
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
      </pre>
      <ListItem>
        Using the above payload schema make a POST request to the endpoint.
      </ListItem>
      <pre
        style={{
          backgroundColor: "#f5f5f5",
          padding: 10,
          borderRadius: 15,
          width: "60vw",
          maxWidth: 400,
          whiteSpace: "initial",
        }}
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
      </pre>
      <ListItem>
        If the request is a success, the response will be in the format given
        below.
      </ListItem>
      <pre
        style={{
          backgroundColor: "#f5f5f5",
          padding: 10,
          borderRadius: 15,
          width: "60vw",
          maxWidth: 400,
          whiteSpace: "initial",
        }}
      >
        {JSON.stringify(
          props.serviceInfo.model.inferenceEndPoint["schema"]["response"],
          null,
          1
        )}
      </pre>
    </OrderedList>
  );
};

export default Documentation;
