// Products.tsx - Products listing with full filters, description search, and sorting
import { useState, useMemo } from "react";
import Filters from "../components/Filters/Filters";
import ProductGrid from "../components/ProductGrid/ProductGrid";
import { useProductCatalog } from "../context/ProductCatalogContext";
import "./Products.css";

interface ProductsProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  setCurrentPage: (page: string) => void;
}

function Products({ selectedCategory, setSelectedCategory, searchQuery, setSearchQuery, setCurrentPage }: ProductsProps) {
  const { products: allProducts } = useProductCatalog();
  const [sortBy, setSortBy] = useState("default");
  const [conditionFilter, setConditionFilter] = useState("All");
  const [warrantyFilter, setWarrantyFilter] = useState("All");
  const [priceRange, setPriceRange] = useState("All");
  const [discountFilter, setDiscountFilter] = useState("All");
  const [brandFilter, setBrandFilter] = useState("All");
  const [ratingFilter, setRatingFilter] = useState("All");
  const [availabilityFilter, setAvailabilityFilter] = useState("All");

  const filteredProducts = useMemo(() => {
    let result = [...allProducts];

    if (selectedCategory && selectedCategory !== "All") {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Search by name, brand, category, AND description
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (conditionFilter !== "All") result = result.filter((p) => p.condition === conditionFilter);
    if (warrantyFilter !== "All") result = result.filter((p) => p.warranty === warrantyFilter);

    if (priceRange !== "All") {
      const [min, max] = priceRange.split("-").map(Number);
      result = result.filter((p) => p.price >= min && p.price <= max);
    }

    if (discountFilter === "on-sale") result = result.filter((p) => p.discount > 0);
    else if (discountFilter === "no-discount") result = result.filter((p) => p.discount === 0);

    if (brandFilter !== "All") result = result.filter((p) => p.brand === brandFilter);

    if (ratingFilter !== "All") {
      const minR = parseFloat(ratingFilter);
      result = result.filter((p) => p.rating >= minR);
    }

    if (availabilityFilter === "in-stock") result = result.filter((p) => p.stock > 0);
    else if (availabilityFilter === "out-of-stock") result = result.filter((p) => p.stock === 0);

    switch (sortBy) {
      case "price-low": result.sort((a, b) => a.price - b.price); break;
      case "price-high": result.sort((a, b) => b.price - a.price); break;
      case "alpha": result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "rating": result.sort((a, b) => b.rating - a.rating); break;
      case "discount": result.sort((a, b) => b.discount - a.discount); break;
    }

    return result;
  }, [selectedCategory, searchQuery, conditionFilter, warrantyFilter, priceRange, discountFilter, brandFilter, ratingFilter, availabilityFilter, sortBy]);

  const handleReset = () => {
    setSortBy("default"); setConditionFilter("All"); setWarrantyFilter("All");
    setPriceRange("All"); setDiscountFilter("All"); setBrandFilter("All");
    setRatingFilter("All"); setAvailabilityFilter("All");
    setSearchQuery(""); setSelectedCategory("All");
  };

  return (
    <div className="products-page">
      <div className="breadcrumb">
        <button className="breadcrumb-link" onClick={() => setCurrentPage("home")}>Home</button>
        <span className="breadcrumb-sep">›</span>
        <span className="breadcrumb-current">{selectedCategory === "All" ? "All Products" : selectedCategory}</span>
      </div>
      <div className="products-page-header">
        <h2>📦 Products {selectedCategory !== "All" && <span className="products-page-cat-tag">{selectedCategory}</span>}</h2>
      </div>
      <Filters
        sortBy={sortBy} setSortBy={setSortBy}
        conditionFilter={conditionFilter} setConditionFilter={setConditionFilter}
        warrantyFilter={warrantyFilter} setWarrantyFilter={setWarrantyFilter}
        priceRange={priceRange} setPriceRange={setPriceRange}
        discountFilter={discountFilter} setDiscountFilter={setDiscountFilter}
        brandFilter={brandFilter} setBrandFilter={setBrandFilter}
        ratingFilter={ratingFilter} setRatingFilter={setRatingFilter}
        availabilityFilter={availabilityFilter} setAvailabilityFilter={setAvailabilityFilter}
        searchQuery={searchQuery} setSearchQuery={setSearchQuery}
        totalResults={filteredProducts.length} onReset={handleReset}
        selectedCategory={selectedCategory}
      />
      <ProductGrid products={filteredProducts} onResetFilters={handleReset} />
    </div>
  );
}

export default Products;
