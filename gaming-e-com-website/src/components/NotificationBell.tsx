// NotificationBell.tsx — Bell icon with unread count in navbar
import { useState, useRef, useEffect } from "react";
import { useNotifications } from "../context/NotificationContext";

function NotificationBell() {
  const { notifications, unreadCount, markRead, clearAll } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    if (open) { document.addEventListener("mousedown", h); return () => document.removeEventListener("mousedown", h); }
  }, [open]);

  if (notifications.length === 0) return null;

  return (
    <div ref={ref} style={{position:"relative"}}>
      <button onClick={() => setOpen(!open)} style={{position:"relative",background:"none",border:"1px solid rgba(255,255,255,.08)",borderRadius:"24px",color:"var(--text-primary)",padding:"9px 14px",cursor:"pointer",fontSize:".9rem",display:"flex",alignItems:"center",gap:4}}>
        🔔 {unreadCount > 0 && <span style={{position:"absolute",top:-6,right:-6,background:"var(--color-danger)",color:"#fff",fontSize:".6rem",fontWeight:700,minWidth:18,height:18,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center"}}>{unreadCount}</span>}
      </button>
      {open && (
        <div style={{position:"absolute",top:"calc(100% + 8px)",right:0,width:320,background:"var(--bg-secondary)",border:"1px solid var(--border-color)",borderRadius:"var(--radius-md)",boxShadow:"0 16px 40px rgba(0,0,0,.5)",zIndex:1001,maxHeight:400,overflowY:"auto"}}>
          <div style={{padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid var(--border-color)"}}>
            <strong style={{fontSize:".85rem"}}>Notifications</strong>
            <button onClick={clearAll} style={{background:"none",border:"none",color:"var(--text-muted)",fontSize:".72rem",cursor:"pointer"}}>Clear all</button>
          </div>
          {notifications.slice(0, 15).map(n => (
            <div key={n.id} onClick={() => { markRead(n.id); setOpen(false); }} style={{padding:"10px 14px",borderBottom:"1px solid var(--border-color)",cursor:"pointer",background:n.read?"transparent":"rgba(0,191,255,.03)",transition:"all .15s"}}>
              <div style={{fontSize:".82rem",color:"var(--text-primary)"}}>{n.message}</div>
              <div style={{fontSize:".68rem",color:"var(--text-muted)",marginTop:2}}>{new Date(n.createdAt).toLocaleString("en-IN",{day:"numeric",month:"short",hour:"2-digit",minute:"2-digit"})}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
export default NotificationBell;
