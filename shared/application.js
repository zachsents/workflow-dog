
export const BASE_URL = process.env.NODE_ENV === "production" ?
    "https://workflow.dog" :
    "http://localhost:3000"

export const FUNCTIONS_URL = process.env.NODE_ENV === "production" ?
    functionName => `https://us-central1-workflow-dog.cloudfunctions.net/${functionName}` :
    functionName => `http://localhost:5001/workflow-dog/us-central1/${functionName}`
