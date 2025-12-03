import { useNavigate } from "react-router-dom";
import logo from "../logo.png";
import { getCurrentStudent } from "../api/students";
import "../styles/MainNavMenu.css";

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

  const logout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  const studentLinks: LinkDef[] = [
    { name: "Library", path: "/library", needsStudentContext: true },
    { name: "Rewards", path: "/rewards" },
  ];

  const parentLinks: LinkDef[] = [
    { name: "Child Progress", path: "/ParentProgress" },
    { name: "Library", path: "/ParentLibrary" },
  ];

  const links = userType === "parent" ? parentLinks : studentLinks;
  const homePath = userType === "parent" ? "/parentLanding" : "/studentLanding";

  const go = async (link: LinkDef) => {
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
        background: "#fef6e4",
        boxSizing: "border-box",
        zIndex: 10,
        borderRadius: "12px",
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

      <nav
        style={{
          display: "flex",
          alignItems: "center",
          gap: "24px",
        }}
      >
        {links.map((link) => (
          <button
            key={link.name}
            type="button"
            onClick={() => go(link)}
            className="nav-link"
          >
            {link.name}
          </button>
        ))}

        <button
          type="button"
          onClick={logout}
          className="nav-link"
        >
          Logout
        </button>
      </nav>
    </header>
  );
}
