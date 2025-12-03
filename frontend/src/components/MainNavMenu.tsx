import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./button";
import logo from "../logo.png";

interface NavMenuProps {
  userType?: "parent" | "student";
}

export default function NavMenu({ userType }: NavMenuProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const studentLinks = [
    { name: "Library", path: "/library" },
    { name: "Rewards", path: "/rewards" },
  ];

  const parentLinks = [{ name: "Child Progress", path: "/ParentProgress" }];

  const links = userType === "parent" ? parentLinks : studentLinks;

  const homePath = userType === "parent" ? "/parentLanding" : "/studentLanding";

  return (
    <header
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 24px",
        borderBottom: "1px solid #ddd",
        background: "#fff",
        boxSizing: "border-box",
        zIndex: 10,
      }}
    >
      {/* clickable logo only */}
      <button
        type="button"
        onClick={() => navigate(homePath)}
        style={{
          border: "none",
          background: "none",
          padding: 0,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
        }}
      >
        <img src={logo} alt="ReadySetRead" style={{ height: 80 }} />
      </button>

      {/* menu button + dropdown */}
      <div style={{ position: "relative" }}>
        <Button type="button" onClick={() => setOpen((prev) => !prev)}>
          ☰ Menu
        </Button>

        {open && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: "120%",
              background: "#ffffff",
              border: "1px solid #ddd",
              borderRadius: 8,
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              minWidth: 170,
              padding: "4px 0",
              zIndex: 20,
            }}
          >
            <button
              type="button"
              onClick={logout}
              style={{
                width: "100%",
                padding: "8px 12px",
                background: "none",
                border: "none",
                textAlign: "left",
                cursor: "pointer",
              }}
            >
              Logout
            </button>

            {links.map((link) => (
              <button
                key={link.name}
                type="button"
                onClick={() => go(link.path)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  background: "none",
                  border: "none",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                {link.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
