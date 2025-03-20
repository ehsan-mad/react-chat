import axios from "axios";

const BASE_URL = "https://chat-api-vecx.onrender.com/api"; // Replace with your actual API URL

export const registerUser = async (username, password) => {
  try {
    // Indicate that registration is starting (for example, set loading state in your UI)
    console.log("Starting user registration...");

    // Make a POST request to /auth/register
    const response = await axios.post(`${BASE_URL}/auth/register`, {
      username,
      password,
    });

    // Log the successful registration
    console.log("Registration response:", response.data);

    // Extract the user details from the response
    const { id, username: registeredUsername } = response.data;

    // Return the new user's data
    return { id, username: registeredUsername };
  } catch (error) {
    // If something goes wrong, log the error and throw it to handle elsewhere
    console.error("Registration error:", error.response?.data || error.message);
    throw error;
  }
};
