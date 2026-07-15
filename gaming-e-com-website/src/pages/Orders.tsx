// Orders.tsx — Reads from server database via api.orders
import { useOrders } from "../context/OrderContext";
import ProductImage from "../components/ProductImage/ProductImage";
import "./StaticPages.css";

function formatPrice(n: number) { return n.toLocaleString("en-IN"); }
const pLabels: Record<string,string> = {cod:"Cash on Delivery",upi:"UPI (Demo)",card:"Card (Demo)"};

interface Props { setCurrentPage: (p: string) => void; setSelectedCategory: (c: string) => void }

function Orders({ setCurrentPage, setSelectedCategory }: Props) {
  const { user } = useAuth();
  const { orders, loading, refreshOrders } = useOrders();

  if (loading) return <div className="static-page"><h1>My Orders</h1><p style={{color:"var(--text-secondary)"}}>Loading...</p></div>;

  if (orders.length === 0) return (
    <div className="static-page">
      <button className="static-back" onClick={() => setCurrentPage("home")}>← Back to Home</button>
      <h1>My Orders</h1>
      <div className="static-empty">
        <div className="static-empty-icon">📦</div>
        <h3>No orders yet</h3>
        <p>{user ? `Orders placed as ${user.name} will appear here from the live database.` : "Login to see your personal order history across devices."}</p>
        <button className="static-btn static-btn-primary" onClick={() => { setSelectedCategory("All"); setCurrentPage("products"); }}>Start Shopping</button>
      </div>
    </div>
  );

  const statusBadge = (s: string) => {
    const colors: Record<string,string> = {Processing:"#f59e0b",Packaging:"#3b82f6",Shipping:"#8b5cf6",Delivering:"#ec4899","Parceled/Arrived":"#22c55e",Cancelled:"#ef4444"};
    return <span style={{display:"inline-block",padding:"2px 8px",borderRadius:3,fontSize:".7rem",fontWeight:700,textTransform:"uppercase",marginLeft:6,background:(colors[s]||"#888")+"20",color:colors[s]||"#888"}}>{s}</span>;
  };

  return (
    <div className="static-page static-page-wide">
      <button className="static-back" onClick={() => setCurrentPage("home")}>← Back to Home</button>
      <h1>{user ? `${user.name}'s Orders` : "My Orders"}</h1>
      <p className="static-lead">{orders.length} order{orders.length>1?"s":""} from database</p>
      {orders.map(o => (
        <article key={o.orderId} className="order-card">
          <div className="order-card-head">
            <div><div className="order-id">{o.orderId} {statusBadge(o.status)}</div>
              <div className="order-meta">{new Date(o.placedAt).toLocaleString("en-IN",{day:"numeric",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})} · {pLabels[o.paymentMethod]||o.paymentMethod} · Est. {o.estimatedDelivery}</div>
            </div>
            <div className="order-meta">{o.address?.fullName} · {o.address?.city}, {o.address?.pincode}</div>
          </div>
          <div className="order-items-mini">
            {o.items?.map((i:any) => (
              <div key={`${o.orderId}-${i.id}`} className="order-item-mini">
                <ProductImage src={i.image} alt={i.name} />
                <span style={{flex:1,color:"var(--text-primary)",fontWeight:600}}>{i.name}</span>
                <span className="order-meta">×{i.quantity}</span>
                <span style={{color:"var(--color-primary)",fontWeight:700}}>₹{formatPrice(i.price*i.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="order-total-row"><span>Grand total (incl. GST)</span><span>₹{formatPrice(o.grandTotal)}</span></div>
        </article>
      ))}
    </div>
  );
}
export default Orders;
