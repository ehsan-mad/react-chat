import axios from "axios";

const BASE_URL = "https://chat-api-vecx.onrender.com/api"; // Replace with your actual API URL

export const loginUser = async (username, password) => {
  try {
    // Send a POST request to the login endpoint with username and password.
    const response = await axios.post(`${BASE_URL}/auth/login`, {
      username,
      password,
    });

    // Extract the returned data (id and username) from the response.
    const { id, username: returnedUsername } = response.data;

    // Store the user ID in localStorage so you can use it in other requests.
    localStorage.setItem("userId", id);
    
    console.log("Login successful, user ID stored:", id);
    return { id, username: returnedUsername };
  } catch (error) {
    console.error("Login failed:", error.response?.data || error.message);
    throw error;
  }
};
