// Sidebar.tsx - Left sidebar with grouped, expandable category navigation
import { useState } from "react";
import "./Sidebar.css";

interface SubCategory {
  label: string;
  icon: string;
  value: string;
}

interface CategoryGroup {
  title: string;
  icon: string;
  subs: SubCategory[];
}

const categoryGroups: CategoryGroup[] = [
  {
    title: "PC Components",
    icon: "🧠",
    subs: [
      { label: "CPU", icon: "🔲", value: "CPU" },
      { label: "GPU", icon: "🖥️", value: "GPU" },
      { label: "RAM", icon: "💾", value: "RAM" },
      { label: "SSD", icon: "💿", value: "SSD" },
    ],
  },
  {
    title: "Gaming",
    icon: "🎮",
    subs: [
      { label: "Consoles", icon: "🕹️", value: "Console" },
      { label: "Handhelds", icon: "📱", value: "Handheld Gaming" },
      { label: "Controllers", icon: "🎮", value: "Controller" },
      { label: "Gaming Laptops", icon: "💻", value: "Gaming Laptop" },
    ],
  },
  {
    title: "Displays",
    icon: "🖥️",
    subs: [
      { label: "Monitors", icon: "🖵", value: "Monitor" },
    ],
  },
  {
    title: "Accessories",
    icon: "🎧",
    subs: [
      { label: "Gaming Mouse", icon: "🖱️", value: "Gaming Mouse" },
      { label: "Gaming Keyboard", icon: "⌨️", value: "Gaming Keyboard" },
      { label: "Gaming Headset", icon: "🎧", value: "Gaming Headset" },
      { label: "Gaming Chair", icon: "🪑", value: "Gaming Chair" },
      { label: "Gaming Desk", icon: "🗄️", value: "Gaming Desk" },
      { label: "Tablets", icon: "📲", value: "Tablet" },
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
          <span className="sidebar-header-icon">⚙️</span>
          <span className="sidebar-header-text">Categories</span>
        </div>

        {/* All Products button */}
        <button
          className={`sidebar-item sidebar-all ${selectedCategory === "All" ? "active" : ""}`}
          onClick={() => handleCategoryClick("All")}
        >
          <span className="sidebar-item-icon">📦</span>
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
                  <span className="sidebar-sub-icon">{sub.icon}</span>
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
