import React, { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  X, 
  Send, 
  Paperclip, 
  Smile, 
  MoreHorizontal,
  Minus,
  Maximize2
} from 'lucide-react';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState('');

  // Lắng nghe sự kiện để mở chat từ các trang khác
  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('openChat', handleOpenChat);
    return () => window.removeEventListener('openChat', handleOpenChat);
  }, []);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-16 h-16 bg-black text-white rounded-2xl border-4 border-black shadow-brutal hover:bg-primary hover:-translate-y-1 transition-all z-50 flex items-center justify-center group"
      >
        <MessageCircle size={28} className="group-hover:scale-110 transition-transform" />
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 border-2 border-black rounded-full flex items-center justify-center text-[10px] font-black">2</div>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-8 right-8 w-[400px] bg-white border-4 border-black rounded-[2.5rem] shadow-brutal z-50 overflow-hidden transition-all duration-300 flex flex-col ${isMinimized ? 'h-20' : 'h-[550px]'}`}>
      {/* Header */}
      <div className="p-5 border-b-4 border-black flex items-center justify-between bg-white relative z-10">
        <div className="flex items-center gap-3">
           <div className="relative">
              <div className="w-10 h-10 rounded-full border-2 border-black bg-primary overflow-hidden">
                 <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100" alt="Shop" className="w-full h-full object-cover" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-black rounded-full"></div>
           </div>
           <div>
              <h4 className="text-xs font-black uppercase tracking-tight">UTEShop Official</h4>
              <p className="text-[8px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1">
                 Đang hoạt động
              </p>
           </div>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setIsMinimized(!isMinimized)} className="p-2 hover:bg-gray-100 rounded-lg transition-all"><Minus size={16}/></button>
           <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-all"><X size={16}/></button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages Area */}
          <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-[#F9F9F7] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]">
            <div className="flex justify-center">
               <span className="bg-white border-2 border-black px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-gray-400">Hôm nay</span>
            </div>

            {/* Incoming */}
            <div className="flex gap-3 max-w-[85%]">
               <div className="w-8 h-8 rounded-full border-2 border-black bg-primary overflow-hidden shrink-0">
                  <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100" alt="Shop" className="w-full h-full object-cover" />
               </div>
               <div className="space-y-1">
                  <div className="bg-white border-2 border-black p-3 rounded-2xl rounded-tl-none shadow-subtle">
                     <p className="text-[11px] font-medium leading-relaxed">Chào bạn! Rất vui được hỗ trợ bạn. Bạn đang quan tâm đến sản phẩm nào ạ?</p>
                  </div>
                  <span className="text-[8px] font-bold text-gray-300 ml-1">14:02</span>
               </div>
            </div>

            {/* Product Context (Automatic when open from product page) */}
            <div className="flex justify-end">
               <div className="bg-white border-2 border-black p-2 rounded-2xl shadow-subtle flex gap-3 w-64">
                  <div className="w-12 h-14 bg-gray-100 rounded-lg border border-black/5 overflow-hidden">
                     <img src="https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=100" alt="Product" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex flex-col justify-center">
                     <p className="text-[9px] font-black uppercase truncate">Heritage Jacket V.01</p>
                     <p className="text-[10px] font-black text-primary mt-1">1.250.000₫</p>
                  </div>
               </div>
            </div>

            {/* Outgoing */}
            <div className="flex flex-row-reverse gap-3 max-w-[85%] ml-auto text-right">
               <div className="w-8 h-8 rounded-full border-2 border-black bg-black text-white flex items-center justify-center text-[8px] font-black shrink-0">B</div>
               <div className="space-y-1">
                  <div className="bg-black text-white border-2 border-black p-3 rounded-2xl rounded-tr-none shadow-subtle">
                     <p className="text-[11px] font-medium leading-relaxed">Chào shop, áo này còn size L màu xanh không ạ?</p>
                  </div>
                  <span className="text-[8px] font-bold text-gray-400 mr-1">14:05</span>
               </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-5 border-t-4 border-black bg-white">
            <div className="flex items-center gap-3 bg-gray-50 border-2 border-black rounded-2xl p-1.5 pl-3 shadow-inner">
               <button className="text-gray-400 hover:text-black transition-colors"><Smile size={18}/></button>
               <input 
                type="text" 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Nhập tin nhắn..." 
                className="flex-grow bg-transparent border-none focus:outline-none text-[11px] font-bold py-1.5" 
               />
               <button className={`p-2 rounded-xl transition-all ${message ? 'bg-primary text-white shadow-subtle' : 'text-gray-300'}`}>
                  <Send size={18} />
               </button>
            </div>
            <div className="flex justify-between items-center mt-3 px-1">
               <div className="flex gap-2">
                  <button className="text-[8px] font-black uppercase text-gray-400 hover:text-primary transition-all flex items-center gap-1"><Paperclip size={12}/> Đính kèm</button>
                  <button className="text-[8px] font-black uppercase text-gray-400 hover:text-primary transition-all flex items-center gap-1">Sản phẩm</button>
               </div>
               <span className="text-[8px] font-bold text-gray-300">Nhấn Enter để gửi</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatWidget;
