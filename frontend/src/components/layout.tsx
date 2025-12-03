import { Outlet } from "react-router-dom";
import NavMenu from "./MainNavMenu";

type LayoutProps = {
  userType?: "parent" | "student";
};

export default function Layout({ userType }: LayoutProps) {
  return (
    <div
      className="page-background"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <NavMenu userType={userType} />

      <main
        style={{
          flex: 1,
          padding: "1.5rem 2rem",
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
