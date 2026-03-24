import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      <Sidebar />

      <div className="flex-grow-1 bg-light">
        <Navbar />
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}

export default Layout;