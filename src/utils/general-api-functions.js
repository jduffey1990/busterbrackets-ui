import {parseError} from "@/utils/error";


export const updateClientRefreshField = async ($axios, id, showError) => {
    try {
        await $axios.patch(`/api/users/refresh-portfolio/${id}/`);
    } catch (error) {
        showError({message: parseError(error), error: true});
    }
}