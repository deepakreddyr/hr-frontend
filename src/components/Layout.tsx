import React, { useRef, useState } from "react";
import Sidebar from "./Sidebar";
import { Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);
  const btnContainerRef = useRef<HTMLDivElement>(null);

  const expandMenu = () => {
    if (!btnContainerRef.current) return;
    const [simpleBtn, naukriBtn] = btnContainerRef.current.children;

    // N Search moves first
    gsap.fromTo(
      naukriBtn,
      { x: 0, opacity: 0, scale: 0.6 },
      {
        x: -130,
        opacity: 1,
        scale: 1,
        duration: 0.7,
        ease: "power2.out",
      }
    );

    // S Search follows with a delay
    gsap.fromTo(
      simpleBtn,
      { x: 0, opacity: 0, scale: 0.6 },
      {
        x: 80,
        opacity: 1,
        scale: 1,
        duration: 0.7,
        ease: "power2.out",
        delay: 0.15,
      }
    );
  };

  const collapseMenu = () => {
    if (!btnContainerRef.current) return;
    const [simpleBtn, naukriBtn] = btnContainerRef.current.children;

    // Collapse in reverse order - S Search first, then N Search
    gsap.to(simpleBtn, {
      x: 0,
      opacity: 0,
      scale: 0.6,
      duration: 0.5,
      ease: "power2.in",
    });

    gsap.to(naukriBtn, {
      x: 0,
      opacity: 0,
      scale: 0.6,
      duration: 0.5,
      ease: "power2.in",
      delay: 0.1,
      onComplete: () => setExpanded(false),
    });
  };

  const toggleMenu = () => {
    if (expanded) {
      collapseMenu();
    } else {
      setExpanded(true);
      expandMenu();
    }
  };

  const handleButtonClick = (path: string) => {
    collapseMenu(); // collapse with smooth animation
    // Add a delay before navigation to let animation complete
    setTimeout(() => navigate(path), 300);
  };

  return (
    <div className="flex h-screen bg-background relative">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-6">{children}</div>
      </main>

      {/* Floating Action Menu */}
      <div className="fixed bottom-6 right-6 flex items-center z-50">
        <div ref={btnContainerRef} className="flex items-center absolute right-12">
          <button
            onClick={() => handleButtonClick("/simple-shortlist")}
            className="btn-primary text-xs w-24 h-10 shadow-lg !rounded-2xl opacity-0"
          >
            S Search
          </button>
          <button
            onClick={() => handleButtonClick("/shortlist")}
            className="btn-primary text-xs w-24 h-10 shadow-lg !rounded-2xl opacity-0 ml-2"
          >
            N Search
          </button>
        </div>

        {/* Main toggle button */}
        <button
          onClick={toggleMenu}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 z-10
            ${expanded ? "bg-secondary text-secondary-foreground rotate-45 border border-border/50 backdrop-blur-md" : "bg-primary text-primary-foreground hover:scale-110"}`}
        >
          {expanded ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </button>
      </div>
    </div>
  );
};

export default Layout;