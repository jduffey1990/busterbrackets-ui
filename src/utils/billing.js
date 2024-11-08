export const submitChangesSubscription = async ($axios) => {
    try {
        // Post data to the update subscription endpoint
        const response = await $axios.post("/api/billing/subscription-quantity-update/");

        if (response.status === 200) {
            console.log("Subscription updated successfully!");
        } else {
            console.error("Unexpected response status:", response.status);
        }

    } catch (error) {
        console.error("Error updating subscription:", error);
        // Optionally, return an error message so it can be handled in the UI
        return {type: "error", message: "There was an error updating the subscription."};
    }
};
