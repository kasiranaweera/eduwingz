import privateClient from "../client/private.client";

const searchEndpoints = {
    globalSearch: (query) => `app/search/?q=${encodeURIComponent(query)}`,
};

const searchApi = {
    globalSearch: async ({ query }) => {
        try {
            const response = await privateClient.get(searchEndpoints.globalSearch(query));
            return { response };
        } catch (err) {
            return { err };
        }
    }
};

export default searchApi;
