import { useNavigate, useLocation } from "react-router-dom";
import logo from "../logo.png";
import { getCurrentStudent, logoutStudent } from "../api/students";
import { logoutParent } from "../api/parents";
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
  const location = useLocation();

  const logout = () => {
    if (userType == "parent") logoutParent();
    else logoutStudent();
    navigate("/");
  };

  // Check if we should show the library link
  const shouldShowLibrary = (link: LinkDef) => {
    if (!link.needsStudentContext) return true;

    // For parent users
    if (userType === "parent") {
      // Show library if on /ParentProgress page OR if studentContext is available
      const isOnParentProgress = location.pathname === "/ParentProgress";
      const targetStudentId = sessionStorage.getItem("targetStudentId");
      const hasStudentContext = targetStudentId !== null;
      console.log("targetStudentId: ", targetStudentId) // DEBUG
      return isOnParentProgress || hasStudentContext;
    }

    // For student users, always show
    return true;
  };

  const studentLinks: LinkDef[] = [
    { name: "Library", path: "/library", needsStudentContext: true },
    { name: "Rewards", path: "/rewards" },
  ];

  const parentLinks: LinkDef[] = [
    { name: "Child Progress", path: "/ParentProgress" },
    { name: "Library", path: "/ParentLibrary", needsStudentContext: true },
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
        console.error("Error preparing library context, student side: ", error);
        return;
      }
    }
    if (userType === "parent" && link.needsStudentContext) {
      try {
        if (sessionStorage.getItem("targetStudentId")) {
          sessionStorage.setItem("meType", JSON.stringify("parent"));
        }
      } catch (error) {
        console.error("Error preparing library context, parent side: ", error);
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
        {links
          .filter((link) => shouldShowLibrary(link))
          .map((link) => (
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
