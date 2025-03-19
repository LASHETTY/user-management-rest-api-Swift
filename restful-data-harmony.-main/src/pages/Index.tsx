
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { toast } from "@/components/ui/use-toast";

const API_BASE_URL = "/api"; // Use the API prefix for all requests

const Index = () => {
  const [serverStatus, setServerStatus] = useState<string>("Checking...");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        console.log("Checking server status...");
        const response = await fetch(`${API_BASE_URL}/users`);
        
        if (response.ok) {
          const contentType = response.headers.get("content-type");
          if (!contentType || !contentType.includes("application/json")) {
            console.error("Server returned non-JSON response:", contentType);
            setServerStatus("Not connected");
            return;
          }
          
          const data = await response.json();
          console.log("Server status response:", data);
          
          if (data && data.data) {
            setServerStatus(data.data.length > 0 ? "Running" : "Running (No users)");
          } else {
            setServerStatus("Running (No users)");
          }
        } else {
          console.error("Server status check failed with status:", response.status);
          setServerStatus("Not connected");
        }
      } catch (error) {
        console.error("Server status check failed:", error);
        setServerStatus("Not connected");
      }
    };

    checkServerStatus();
    
    // Set up periodic status check every 10 seconds
    const intervalId = setInterval(checkServerStatus, 10000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const handleLoadData = async () => {
    setIsLoading(true);
    try {
      console.log("Loading sample data...");
      const response = await fetch(`${API_BASE_URL}/load`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      // Check for non-JSON responses
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Server returned non-JSON response:", contentType);
        throw new Error("Server returned non-JSON response");
      }
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Load data response:", data);
      
      toast({
        title: "Success",
        description: "Sample data loaded successfully!",
        variant: "default",
      });
      
      // Refresh the server status after loading data
      setServerStatus("Checking...");
      const statusResponse = await fetch(`${API_BASE_URL}/users`, {
        headers: {
          'Accept': 'application/json'
        }
      });
      
      if (statusResponse.ok) {
        const statusContentType = statusResponse.headers.get("content-type");
        if (statusContentType && statusContentType.includes("application/json")) {
          const statusData = await statusResponse.json();
          if (statusData && statusData.data) {
            setServerStatus(statusData.data.length > 0 ? "Running" : "Running (No users)");
          } else {
            setServerStatus("Running (No users)");
          }
        }
      }
    } catch (error) {
      console.error("Failed to load data:", error);
      toast({
        title: "Error",
        description: "Failed to load sample data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">REST API Server</CardTitle>
          <CardDescription>
            Node.js REST API with MongoDB for User Management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50 rounded">
            <span className="font-medium">Server Status:</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              serverStatus === "Running" ? "bg-green-100 text-green-800" : 
              serverStatus === "Running (No users)" ? "bg-yellow-100 text-yellow-800" : 
              serverStatus === "Checking..." ? "bg-blue-100 text-blue-800" :
              "bg-red-100 text-red-800"
            }`}>
              {serverStatus}
            </span>
          </div>

          <div className="space-y-2">
            <h3 className="text-lg font-medium">Available Endpoints:</h3>
            <ul className="space-y-1 list-disc list-inside text-gray-700">
              <li><code className="bg-gray-200 px-1 rounded">GET /api/load</code> - Load data from JSONPlaceholder</li>
              <li><code className="bg-gray-200 px-1 rounded">GET /api/users</code> - Get all users</li>
              <li><code className="bg-gray-200 px-1 rounded">GET /api/users/:userId</code> - Get user by ID</li>
              <li><code className="bg-gray-200 px-1 rounded">PUT /api/users</code> - Create a new user</li>
              <li><code className="bg-gray-200 px-1 rounded">DELETE /api/users</code> - Delete all users</li>
              <li><code className="bg-gray-200 px-1 rounded">DELETE /api/users/:userId</code> - Delete user by ID</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button 
            variant="outline" 
            onClick={() => window.open('https://jsonplaceholder.typicode.com', '_blank')}
          >
            View JSONPlaceholder
          </Button>
          <Button 
            onClick={handleLoadData}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "Load Sample Data"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Index;
