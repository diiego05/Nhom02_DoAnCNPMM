import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import ChatWidget from "@/components/chat/ChatWidget";
import { Outlet } from "react-router-dom";

const MainLayout = () => {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <ChatWidget />
    </>
  );
};

export default MainLayout;
