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
//moved the design stuff into the css file it was not working in file
  return (
    <header className="main-nav">

      <button
        type="button"
        onClick={() => navigate(homePath)}
        className="nav-logo-button"
      >
        <img src={logo} alt="ReadySetRead" className="nav-logo" />
      </button>
      <nav className="nav-links">
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

        <button type="button" onClick={logout} className="nav-link">
          Logout
        </button>
      </nav>
    </header>
  );
}
