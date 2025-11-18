// MainLayout.jsx
import Header from "~/components/Header";

const MainLayout = ({ children }) => {
  return (
    <>
      <Header />
      <div className="pt-[80px] md:pt-[64px]">{children}</div>
    </>
  );
};

export default MainLayout;
