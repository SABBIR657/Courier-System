import CustomerDashboard from "./CustomerDashboard";
import AgentDashboard from "./AgentDashboard";
import AdminDashboard from "./AdminDashboard";

const RoleBasedDashboard = () => {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) return <p>Unauthorized</p>;

  const user = JSON.parse(storedUser);

  if (user.role === "agent") return <AgentDashboard />;
  if (user.role === "customer") return <CustomerDashboard />;
  if(user.role === "admin") return <AdminDashboard/>

  return <p>Unknown role: {user.role}</p>;
};

export default RoleBasedDashboard;
