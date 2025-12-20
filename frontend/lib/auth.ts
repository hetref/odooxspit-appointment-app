 export const GetUserData = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { name: "John Doe", email: "john.doe@example.com", role: "admin" }; 
  }
