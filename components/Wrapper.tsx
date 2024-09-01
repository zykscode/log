import AnimatedBackground from './AnimatedBackground';
import DropdownMenu from './Dropdown';
import { Footer } from './Footer';
import Header from './Header';
import Main from './Main';

const Wrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <section className="flex px-4 min-h-screen flex-col">
      <Header />
      <div className="overflow-hidden flex flex-col relative bg-[#d0cbc5] z-20 flex-grow rounded-xl bg-repeat  bg-contain">
        <div className="absolute inset-0 z-[-1]">
          <AnimatedBackground speed={1.5} opacity={0.4} />
        </div>
        <DropdownMenu />
        <Main>{children}</Main>
      </div>
      <Footer />
    </section>
  );
};

export default Wrapper;
