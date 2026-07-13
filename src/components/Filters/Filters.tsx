// Filters.tsx - Full-featured product filtering and sorting controls
import { useEffect, useMemo } from "react";
import { useProductCatalog } from "../../context/ProductCatalogContext";
import "./Filters.css";

interface FiltersProps {
  sortBy: string; setSortBy: (v: string) => void;
  conditionFilter: string; setConditionFilter: (v: string) => void;
  warrantyFilter: string; setWarrantyFilter: (v: string) => void;
  priceRange: string; setPriceRange: (v: string) => void;
  discountFilter: string; setDiscountFilter: (v: string) => void;
  brandFilter: string; setBrandFilter: (v: string) => void;
  ratingFilter: string; setRatingFilter: (v: string) => void;
  availabilityFilter: string; setAvailabilityFilter: (v: string) => void;
  searchQuery: string; setSearchQuery: (v: string) => void;
  totalResults: number; onReset: () => void;
  /** Active product category — brands list is scoped to this category */
  selectedCategory: string;
}

function Filters({
  sortBy, setSortBy, conditionFilter, setConditionFilter,
  warrantyFilter, setWarrantyFilter, priceRange, setPriceRange,
  discountFilter, setDiscountFilter, brandFilter, setBrandFilter,
  ratingFilter, setRatingFilter, availabilityFilter, setAvailabilityFilter,
  searchQuery, setSearchQuery, totalResults, onReset,
  selectedCategory,
}: FiltersProps) {
  const { products: allProducts } = useProductCatalog();

  // Brands that actually sell products in the selected category
  // (when "All", show every brand present in the catalog)
  const brands = useMemo(() => {
    const scoped =
      selectedCategory && selectedCategory !== "All"
        ? allProducts.filter((p) => p.category === selectedCategory)
        : allProducts;
    const set = new Set(scoped.map((p) => p.brand));
    return Array.from(set).sort();
  }, [selectedCategory]);

  // If category changes and the current brand isn't sold in that category, clear brand filter
  useEffect(() => {
    if (brandFilter !== "All" && !brands.includes(brandFilter)) {
      setBrandFilter("All");
    }
  }, [brands, brandFilter, setBrandFilter]);

  return (
    <div className="filters">
      <input className="filter-search" type="text" placeholder="🔍 Search name, brand, category, description..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />

      <select className="filter-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="default">Sort By</option>
        <option value="price-low">Price: Low → High</option>
        <option value="price-high">Price: High → Low</option>
        <option value="alpha">A → Z</option>
        <option value="rating">Top Rated</option>
        <option value="discount">Biggest Discount</option>
      </select>

      <select className="filter-select" value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
        <option value="All">All Brands</option>
        {brands.map((b) => <option key={b} value={b}>{b}</option>)}
      </select>

      <select className="filter-select" value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)}>
        <option value="All">All Conditions</option>
        <option value="New">New</option>
        <option value="Pre-Owned">Pre-Owned</option>
      </select>

      <select className="filter-select" value={warrantyFilter} onChange={(e) => setWarrantyFilter(e.target.value)}>
        <option value="All">All Warranties</option>
        <option value="No Warranty">No Warranty</option>
        <option value="6 Months">6 Months</option>
        <option value="1 Year">1 Year</option>
        <option value="2 Years">2 Years</option>
        <option value="3 Years">3 Years</option>
        <option value="5 Years">5 Years</option>
        <option value="Lifetime">Lifetime</option>
      </select>

      <select className="filter-select" value={priceRange} onChange={(e) => setPriceRange(e.target.value)}>
        <option value="All">All Prices</option>
        <option value="0-10000">Under ₹10K</option>
        <option value="10000-25000">₹10K – ₹25K</option>
        <option value="25000-50000">₹25K – ₹50K</option>
        <option value="50000-100000">₹50K – ₹1L</option>
        <option value="100000-999999">Above ₹1L</option>
      </select>

      <select className="filter-select" value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)}>
        <option value="All">All Ratings</option>
        <option value="4.5">4.5★ &amp; above</option>
        <option value="4.0">4.0★ &amp; above</option>
        <option value="3.5">3.5★ &amp; above</option>
      </select>

      <select className="filter-select" value={availabilityFilter} onChange={(e) => setAvailabilityFilter(e.target.value)}>
        <option value="All">All Availability</option>
        <option value="in-stock">In Stock</option>
        <option value="out-of-stock">Sold Out</option>
      </select>

      <select className="filter-select" value={discountFilter} onChange={(e) => setDiscountFilter(e.target.value)}>
        <option value="All">All Discounts</option>
        <option value="on-sale">On Sale</option>
        <option value="no-discount">No Discount</option>
      </select>

      <button className="filter-reset-btn" onClick={onReset}>✕ Reset</button>

      <span className="filters-results"><strong>{totalResults}</strong> found</span>
    </div>
  );
}

export default Filters;
