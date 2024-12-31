import {parseError} from "@/utils/error";


export const updateClientRefreshField = async ($axios, id, showError) => {
    try {
        // patch api call.  id coming in can be advisor or client with different results in the backend view
        //users module RefreshPortfolioView
        await $axios.patch(`/api/users/refresh-portfolio/${id}/`);
    } catch (error) {
        showError({message: parseError(error), error: true});
    }
}