import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./button";
import logo from "../logo.png";
import { getCurrentStudent } from "../api/students";

interface NavMenuProps {
  userType?: "parent" | "student";
}

type LinkDef = {
  name: string;
  path: string;
  needsStudentContext?: boolean;
};

export default function NavMenu({ userType }: NavMenuProps) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const logout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const studentLinks: LinkDef[] = [
    { name: "Library", path: "/library", needsStudentContext: true },
    { name: "Rewards", path: "/rewards" },
  ];
//changed the routing file idk if there is a better fix then doing this and having two seperate libary routes someone can fix if want
  const parentLinks: LinkDef[] = [
    { name: "Child Progress", path: "/ParentProgress" },
    { name: "Library", path: "/ParentLibrary" },
  ];

  const links = userType === "parent" ? parentLinks : studentLinks;

  const homePath = userType === "parent" ? "/parentLanding" : "/studentLanding";

  const go = async (link: LinkDef) => {
    setOpen(false);

    if (userType === "student" && link.needsStudentContext) {
      try {
        const result = await getCurrentStudent();
        const student_id = result.child_id;
        sessionStorage.setItem("targetStudentId", JSON.stringify(student_id));
        sessionStorage.setItem("meType", JSON.stringify("student"));
      } catch (error) {
        console.error("Error preparing library context", error);
        return;
      }
    }

    navigate(link.path);
  };

  return (
    <header
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "12px 24px",
        borderBottom: "1px solid #ddd",
        background: "transparent",
        boxSizing: "border-box",
        zIndex: 10,
      }}
    >
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
                onClick={() => go(link)}
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
