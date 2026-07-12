// CartPage.tsx - Cart page wrapper, passes setSelectedCategory through to Cart
import Cart from "../components/Cart/Cart";

interface CartPageProps {
  setCurrentPage: (page: string) => void;
  setSelectedCategory: (cat: string) => void;
}

function CartPage({ setCurrentPage, setSelectedCategory }: CartPageProps) {
  return (
    <div className="cart-page-wrapper">
      <Cart setCurrentPage={setCurrentPage} setSelectedCategory={setSelectedCategory} />
    </div>
  );
}

export default CartPage;
