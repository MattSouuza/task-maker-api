import http from "node:http";
import { handleJson } from "./middlewares/handle-json.js";
import { handleEndpoint } from "./middlewares/handle-endpoint.js";

const server = http.createServer(async (req, res) => {
   try {
      await handleJson(req, res);
   } catch (error) {
      return res.writeHead(500).end(JSON.stringify({ message: `Internal Error: ${error}` }));
   }

   const endpointHandler = handleEndpoint(req, res);

   if (!endpointHandler) {
      return res.writeHead(404).end(JSON.stringify({ message: "Resource not found :(" }));
   }

   try {
      return endpointHandler(req, res);
   } catch (error) {
      return res.writeHead(500).end(JSON.stringify({ message: `Internal Error: ${error}` }));
   }
});

server.listen(4000);