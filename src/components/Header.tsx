import kiologo from "/kio_logo_aufweiss.svg";
function Header() {
  return (
    <header>
      <img src={kiologo} alt="KIO Logo" />
      <h1>BundlAR</h1>
    </header>
  );
}
export default Header;
