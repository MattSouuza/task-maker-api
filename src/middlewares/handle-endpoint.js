import { extractQueryParams } from "../utils/extract-query-params.js";
import { routes } from "../routes.js";

export const handleEndpoint = (req) => {
    const { method, url } = req;

    const route = routes.find((route) => route.method === method && route.path.test(url));

    if (!route) return;

    // obtem o 'objeto regex' que contem o 'route parameter' e o 'query params' (se houver) 
    const routeParams = req.url.match(route.path);

    const { query, ...params } = routeParams.groups;

    req.params = params;
    req.query = query ? extractQueryParams(query) : {}; 

    return route.handler;
}