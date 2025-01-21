const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div>
      <h1>Dashboard</h1>
      {user ? (
        <>
          <h2>Welcome, {user.firstName} {user.lastName}</h2>
          <p>Email: {user.email}</p>
        </>
      ) : (
        <p>User data is not available.</p>
      )}
    </div>
  );
};

export default Dashboard;
