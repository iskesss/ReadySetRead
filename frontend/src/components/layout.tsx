import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import NavMenu from "./MainNavMenu";

//Api imports
import { getBackgroundSkin } from "../api/rewards";

type LayoutProps = {
  userType?: "parent" | "student";
};

export default function Layout({ userType }: LayoutProps) {
  const location = useLocation();
  const [pageBackground, setPageBackground] = useState<string | null>(null);

  //ON PAGE LOAD: get current background skin (only for students)
  useEffect(() => {
    if (userType !== "student") return;

    const fetchData = async () => {
      try {
        const result = await getBackgroundSkin()
        if (result.bg_skin) {
          setPageBackground(result.bg_skin)
        }
      } catch (error) {
        console.error('Error: ', error)
      }
    }
    fetchData()
  }, [userType, location])

  return (
    <div
      className="page-background"
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        padding: 0,
        margin: 0,
        boxSizing: "border-box",
        ...(pageBackground && { background: pageBackground, transition: 'background 0.5s ease' }),
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
