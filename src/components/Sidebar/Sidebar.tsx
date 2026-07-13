// Sidebar.tsx - Left sidebar with grouped, expandable category navigation
import { useState, type ReactNode } from "react";
import {
  CategoryIcon,
  PackageIcon,
  SettingsIcon,
  CpuIcon,
  ConsoleIcon,
  MonitorIcon,
  HeadsetIcon,
} from "../Icons/Icons";
import "./Sidebar.css";

interface SubCategory {
  label: string;
  value: string;
}

interface CategoryGroup {
  title: string;
  icon: ReactNode;
  subs: SubCategory[];
}

const categoryGroups: CategoryGroup[] = [
  {
    title: "PC Components",
    icon: <CpuIcon size={16} />,
    subs: [
      { label: "CPU", value: "CPU" },
      { label: "GPU", value: "GPU" },
      { label: "RAM", value: "RAM" },
      { label: "SSD", value: "SSD" },
      { label: "PC Cabinets", value: "PC Cabinet" },
    ],
  },
  {
    title: "Gaming",
    icon: <ConsoleIcon size={16} />,
    subs: [
      { label: "Consoles", value: "Console" },
      { label: "Handhelds", value: "Handheld Gaming" },
      { label: "Controllers", value: "Controller" },
      { label: "Gaming Laptops", value: "Gaming Laptop" },
    ],
  },
  {
    title: "Displays",
    icon: <MonitorIcon size={16} />,
    subs: [
      { label: "Monitors", value: "Monitor" },
    ],
  },
  {
    title: "Accessories",
    icon: <HeadsetIcon size={16} />,
    subs: [
      { label: "Gaming Mouse", value: "Gaming Mouse" },
      { label: "Gaming Keyboard", value: "Gaming Keyboard" },
      { label: "Gaming Headset", value: "Gaming Headset" },
      { label: "Gaming Chair", value: "Gaming Chair" },
      { label: "Gaming Desk", value: "Gaming Desk" },
      { label: "Tablets", value: "Tablet" },
    ],
  },
];

interface SidebarProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  setCurrentPage: (page: string) => void;
}

function Sidebar({ selectedCategory, setSelectedCategory, setCurrentPage }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  // Track which groups are expanded (default: all open)
  const [expanded, setExpanded] = useState<Record<string, boolean>>(
    Object.fromEntries(categoryGroups.map((g) => [g.title, true]))
  );

  const toggleGroup = (title: string) => {
    setExpanded((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleCategoryClick = (value: string) => {
    setSelectedCategory(value);
    setCurrentPage("products");
    setIsOpen(false);
  };

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? "open" : ""}`} onClick={() => setIsOpen(false)} />

      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <span className="sidebar-header-icon">
            <SettingsIcon size={18} />
          </span>
          <span className="sidebar-header-text">Categories</span>
        </div>

        {/* All Products button */}
        <button
          className={`sidebar-item sidebar-all ${selectedCategory === "All" ? "active" : ""}`}
          onClick={() => handleCategoryClick("All")}
        >
          <span className="sidebar-item-icon">
            <PackageIcon size={18} />
          </span>
          <span className="sidebar-item-label">All Products</span>
        </button>

        {/* Grouped categories */}
        {categoryGroups.map((group) => (
          <div key={group.title} className="sidebar-group">
            <button className="sidebar-group-title" onClick={() => toggleGroup(group.title)}>
              <span className="sidebar-group-icon">{group.icon}</span>
              <span className="sidebar-group-label">{group.title}</span>
              <span className={`sidebar-group-arrow ${expanded[group.title] ? "expanded" : ""}`}>▾</span>
            </button>
            <div className={`sidebar-group-subs ${expanded[group.title] ? "open" : ""}`}>
              {group.subs.map((sub) => (
                <button
                  key={sub.value}
                  className={`sidebar-sub-item ${selectedCategory === sub.value ? "active" : ""}`}
                  onClick={() => handleCategoryClick(sub.value)}
                >
                  <span className="sidebar-sub-icon">
                    <CategoryIcon category={sub.value} size={15} />
                  </span>
                  <span className="sidebar-sub-label">{sub.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </aside>

      <button className="sidebar-toggle" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle categories">
        {isOpen ? "✕" : "☰"}
      </button>
    </>
  );
}

export default Sidebar;
