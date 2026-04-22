import { useState } from 'react';
import { BicepsFlexed, ArrowLeft } from 'lucide-react';
import api from '../lib/api';

export default function NutritionChat() {
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState('');
  const [chat, setChat] = useState([
    { role: 'assistant', text: "Hi! I'm your NutriAI Coach. I've analyzed your recent eating patterns. Ask me anything about how to improve!" }
  ]);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!msg.trim() || loading) return;
    const userMsg = msg;
    setMsg('');
    setChat(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const res = await api.post('/analysis/chat', { 
        message: userMsg,
        chatHistory: chat.slice(-4) // Send last few turns for context
      });
      setChat(prev => [...prev, { role: 'assistant', text: res.data.data }]);
    } catch (err) {
      setChat(prev => [...prev, { role: 'assistant', text: "Sorry, I had a glitch. Can you try again?" }]);
    } finally {
      setLoading(false);
      // Auto scroll
      setTimeout(() => {
        const el = document.getElementById('chat-scroll');
        if (el) el.scrollTop = el.scrollHeight;
      }, 100);
    }
  };

  return (
    <>
      <style>{`
        .chat-bubble { position: fixed; bottom: 105px; right: 24px; width: 56px; height: 56px; border-radius: 50%; background: rgba(163, 255, 106, 0.15); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(163, 255, 106, 0.3); color: var(--lime); display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 8px 32px rgba(0,0,0,0.2); z-index: 1000; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
        .chat-bubble:hover { transform: scale(1.1); background: rgba(163, 255, 106, 0.25); border-color: var(--lime); }
        .chat-window { position: fixed; bottom: 175px; right: 24px; width: 340px; height: 480px; background: rgba(18, 18, 26, 0.95); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid var(--border); border-radius: 24px; display: flex; flex-direction: column; box-shadow: 0 20px 40px rgba(0,0,0,0.4); z-index: 1001; overflow: hidden; animation: slideUpChat 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
        @keyframes slideUpChat { from { transform: translateY(40px) scale(0.95); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
        .chat-header { padding: 16px 20px; background: rgba(255,255,255,0.03); border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; align-items: center; }
        .chat-body { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
        .msg { max-width: 80%; padding: 10px 14px; border-radius: 14px; font-size: 13px; line-height: 1.5; }
        .msg-coach { align-self: flex-start; background: var(--raised); color: var(--text); border-bottom-left-radius: 2px; }
        .msg-user { align-self: flex-end; background: var(--lime); color: #0A0A0F; border-bottom-right-radius: 2px; font-weight: 500; }
        .chat-footer { padding: 12px 16px; background: rgba(255,255,255,0.02); border-top: 1px solid var(--border); display: flex; align-items: center; gap: 8px; }
        .chat-input { flex: 1; background: var(--raised); border: 1px solid var(--border); border-radius: 12px; padding: 8px 12px; color: white; font-size: 13px; outline: none; }
        .chat-input:focus { border-color: var(--lime-dim); }
        .chat-send { background: var(--lime); color: #0A0A0F; width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: transform 0.15s; }
        .chat-send:active { transform: scale(0.95); }
        
        @media (max-width: 480px) {
           .chat-window { bottom: 0; right: 0; width: 100%; height: 80vh; border-radius: 24px 24px 0 0; }
        }
      `}</style>

      <div className="chat-bubble" onClick={() => setOpen(!open)}>
        {open ? <ArrowLeft size={24} style={{transform: 'rotate(-90deg)'}} /> : <BicepsFlexed size={28} />}
      </div>

      {open && (
        <div className="chat-window">
          <div className="chat-header">
            <div className="flex items-center gap-3">
              <div style={{width: 32, height: 32, borderRadius: 10, background: 'var(--lime-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><BicepsFlexed size={18} color="var(--lime)" /></div>
              <div>
                <div className="space-font" style={{fontSize: 14}}>NutriAI Coach</div>
                <div style={{fontSize: 10, color: 'var(--lime)'}}>Online • AI Assistant</div>
              </div>
            </div>
            <div onClick={() => setOpen(false)} style={{cursor: 'pointer', color: 'var(--muted)', fontSize: 18}}>✕</div>
          </div>

          <div id="chat-scroll" className="chat-body scrollbar-hide">
            {chat.map((c, i) => (
              <div key={i} className={`msg ${c.role === 'assistant' ? 'msg-coach' : 'msg-user'}`}>
                {c.text}
              </div>
            ))}
            {loading && <div className="msg msg-coach" style={{opacity: 0.6}}>Analyzing patterns...</div>}
          </div>

          <div className="chat-footer">
            <input 
              className="chat-input" 
              placeholder="Ask me something..." 
              value={msg} 
              onChange={e => setMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
            />
            <div className="chat-send" onClick={send}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
