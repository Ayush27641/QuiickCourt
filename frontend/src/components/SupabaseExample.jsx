import React from "react";
import { useAuth, useSupabaseData } from "../hooks/useSupabase";

const SupabaseExample = () => {
  const { user, signIn, signOut, loading: authLoading } = useAuth();
  const {
    data: sports,
    loading: sportsLoading,
    error,
  } = useSupabaseData("sports", {
    order: { column: "name", ascending: true },
  });

  const handleSignIn = async () => {
    const { error } = await signIn("test@example.com", "password123");
    if (error) {
      console.error("Sign in error:", error.message);
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      console.error("Sign out error:", error.message);
    }
  };

  if (authLoading) {
    return <div>Loading authentication...</div>;
  }

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Supabase Integration Example</h2>

      {/* Authentication Section */}
      <div
        style={{
          marginBottom: "30px",
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h3>Authentication</h3>
        {user ? (
          <div>
            <p>✅ Signed in as: {user.email}</p>
            <p>User ID: {user.id}</p>
            <button
              onClick={handleSignOut}
              style={{
                padding: "8px 16px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div>
            <p>❌ Not signed in</p>
            <button
              onClick={handleSignIn}
              style={{
                padding: "8px 16px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Sign In (Demo)
            </button>
          </div>
        )}
      </div>

      {/* Sports Data Section */}
      <div
        style={{
          padding: "15px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        <h3>Sports Data (Real-time)</h3>

        {sportsLoading ? (
          <p>Loading sports...</p>
        ) : error ? (
          <div style={{ color: "red" }}>
            <p>❌ Error loading sports: {error.message}</p>
            <p>Make sure to:</p>
            <ul>
              <li>Set up your Supabase project</li>
              <li>Update environment variables</li>
              <li>Run the database schema script</li>
            </ul>
          </div>
        ) : sports && sports.length > 0 ? (
          <div>
            <p>✅ Loaded {sports.length} sports:</p>
            <ul>
              {sports.map((sport) => (
                <li key={sport.id} style={{ marginBottom: "10px" }}>
                  <strong>{sport.name}</strong> - {sport.description}
                  <br />
                  <small style={{ color: "#666" }}>
                    Category: {sport.category} | Players: {sport.min_players}-
                    {sport.max_players}
                  </small>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div>
            <p>⚠️ No sports data found.</p>
            <p>Run the test script to set up sample data:</p>
            <code style={{ background: "#f5f5f5", padding: "5px" }}>
              npm run supabase:setup
            </code>
          </div>
        )}
      </div>

      {/* Setup Instructions */}
      <div
        style={{
          marginTop: "30px",
          padding: "15px",
          backgroundColor: "#f8f9fa",
          borderRadius: "8px",
        }}
      >
        <h3>Setup Instructions</h3>
        <ol>
          <li>
            Create a Supabase project at{" "}
            <a
              href="https://supabase.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              supabase.com
            </a>
          </li>
          <li>Copy your project URL and API keys to the .env files</li>
          <li>Run the database schema script in Supabase SQL Editor</li>
          <li>
            Test the connection: <code>npm run supabase:test</code>
          </li>
        </ol>
        <p>
          See <code>SUPABASE_SETUP.md</code> for detailed instructions.
        </p>
      </div>
    </div>
  );
};

export default SupabaseExample;
