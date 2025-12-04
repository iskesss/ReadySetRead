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
        padding: 0,          // no padding around the nav
        margin: 0,
        boxSizing: "border-box",
      }}
    >
      <NavMenu userType={userType} />

      <main
        style={{
          flex: 1,
          padding: "1.5rem 2rem",  // content padding only
          boxSizing: "border-box",
          width: "100%",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}
