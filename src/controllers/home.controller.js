
export const home = async (req, res) => {
    const response = {
        message: "Welcome to the home page!",
        status: "success"
    };
    res.json(response);
};
