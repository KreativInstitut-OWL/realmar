import { siteConfig } from "../config/site";
function Footer() {
  return (
    <footer>
      <div className="relative grid w-full grid-cols-24 items-start pt-12">
        {/* Row 1 */}
        <div className="col-span-6 flex flex-col gap-10">
          <p className="text-2xl">
            Wir freuen uns,
            <br />
            in Kontakt zu treten!
          </p>
          <div className="socials">
            <a
              href={siteConfig.links.linkedin}
              target="_blank"
              className="relative"
              data-hasqtip={0}
            >
              <img
                data-src="/kio-assets/kio_logos_footer-linkedin.svg"
                className="kio-img-res ls-is-cached lazyloaded"
                alt="aed in"
                src="/kio-assets/kio_logos_footer-linkedin.svg"
                width={40}
                height={40}
              />
            </a>
            <a
              href={siteConfig.links.instagram}
              target="_blank"
              className="relative"
              data-hasqtip={1}
            >
              <img
                data-src="/kio-assets/kio_logos_footer-instagram.svg"
                className="kio-img-res kio-logo-50 ls-is-cached lazyloaded"
                alt="Instagram"
                src="/kio-assets/kio_logos_footer-instagram.svg"
                width={40}
                height={40}
              />
            </a>
          </div>
        </div>
        <div className="col-span-2">
          <p className="mb-4">
            <span className=" bg-white px-2 py-1 text-black">
              Postalische Anschrift
            </span>
          </p>
          <p className="kio-f-s">
            Technische Hochschule Ostwestfalen-Lippe
            <br />
            KreativInstitut.OWL
            <br />
            Emilienstraße 45
            <br />
            32756 Detmold
          </p>
        </div>
        <div className="col-span-6">
          <p className="mb-4">
            <span className=" bg-white px-2 py-1 text-black">Anfahrt</span>
          </p>
          <p className="kio-f-s">
            Kreativ Campus Detmold
            <br />
            Bielefelder Strasse 66a
            <br />
            32756 Detmold
            <br />
            &nbsp;
            <br />
            &nbsp;
            <br />
          </p>
          <a
            href="https://www.google.com/maps/dir/?api=1&destination=Bielefelder+Str.+66,+32756+Detmold&travelmode=driving"
            className=""
            target="_blank"
            data-hasqtip={2}
          >
            Route berechnen
          </a>
        </div>
        {/* Divider 1 */}
        <div className="col-span-full my-16">
          <svg
            id="Ebene_1"
            data-name="Ebene 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 754.11 22.07"
          >
            <defs>
              <style
                dangerouslySetInnerHTML={{
                  __html:
                    "\n                            .kio-svg-footer-line {\n                                fill: none;\n                                stroke: #FFF;\n                                stroke-linecap: round;\n                                stroke-miterlimit: 10;\n                                stroke-width: 1px;\n                            }\n                        ",
                }}
              />
            </defs>
            <path
              className="kio-svg-footer-line"
              d="m4.36,5.05c52.11,2.53,104.33,2.27,156.49,3.38,23.37.5,46.62,1.05,70.01,1.05,72.94-.03,145.87,1.52,218.78,2.81,66.87,1.18,133.74-1.81,200.56-3.29,30.27-.67,60.6-.26,90.88-.26"
            />
          </svg>
        </div>
        {/* Row 2 */}
        <p className="col-span-6 text-xl">
          Das KreativInstitut.OWL
          <br />
          ist ein Verbund der
        </p>
        <a
          href="https://www.th-owl.de/"
          target="_blank"
          title="Technische Hochschule Ostwestfalen-Lippe"
          className="relative col-span-6 h-24 w-full"
        >
          <img
            data-src="/kio-assets/kio_logos_footer-THOWL.svg"
            className="kio-img-res ls-is-cached lazyloaded"
            alt="Technische Hochschule Ostwestfalen-Lippe"
            src="/kio-assets/kio_logos_footer-THOWL.svg"
          />
        </a>
        <a
          href="https://www.uni-paderborn.de/"
          target="_blank"
          title="Universität Paderborn"
          className="relative top-0 col-span-6 h-24 w-full"
        >
          <img
            data-src="/kio-assets/kio_logo_footer-unipaderborn.svg"
            className="kio-img-res ls-is-cached lazyloaded"
            alt="Universität Paderborn"
            src="/kio-assets/kio_logo_footer-unipaderborn.svg"
          />
        </a>
        <a
          href="https://www.hfm-detmold.de/"
          target="_blank"
          className="relative col-span-6 h-24 w-full"
          data-hasqtip={3}
        >
          <img
            data-src="/kio-assets/kio_logos_footer-HfM.svg"
            className="kio-img-res ls-is-cached lazyloaded"
            alt="Hochschule für Musik Detmold"
            src="/kio-assets/kio_logos_footer-HfM.svg"
          />
        </a>
        {/* Divider 2 */}
        <div className="col-span-full my-16">
          <svg
            id="Ebene_1"
            data-name="Ebene 1"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 754.11 22.07"
          >
            <defs>
              <style
                dangerouslySetInnerHTML={{
                  __html:
                    "\n                            .kio-svg-footer-line {\n                                fill: none;\n                                stroke: #FFF;\n                                stroke-linecap: round;\n                                stroke-miterlimit: 10;\n                                stroke-width: 1px;\n                            }\n                        ",
                }}
              />
            </defs>
            <path
              className="kio-svg-footer-line"
              d="m4.36,5.05c52.11,2.53,104.33,2.27,156.49,3.38,23.37.5,46.62,1.05,70.01,1.05,72.94-.03,145.87,1.52,218.78,2.81,66.87,1.18,133.74-1.81,200.56-3.29,30.27-.67,60.6-.26,90.88-.26"
            />
          </svg>
        </div>
        {/* row 3 */}
        <div className="relative col-span-6 h-24 ">
          <img
            data-src="/kio-assets/kio_logos_footer-kio.svg"
            className=""
            alt="KreativInstitut.OWL"
            src="/kio-assets/kio_logos_footer-kio.svg"
          />
        </div>
        <p className="col-span-6">
          ©2023
          <br />
          <a href="https://kreativ.institute/de/impressum">Impressum</a>
        </p>
        <p className="col-span-6">
          <span className="d-none d-md-block">
            <a href="https://kreativ.institute/de/datenschutz">
              Datenschutzerklärung
            </a>
            <br />
            <a href={""}>Dienste anpassen</a>
          </span>
        </p>
        <div className="relative col-span-6 flex h-48 flex-col">
          <p className="mb-8">
            <span className="bg-white px-2 py-1 text-black">
              Gefördert durch
            </span>
          </p>

          <img
            data-src="/kio-assets/kio_logos_footer-Ministerium.svg"
            className="relative"
            alt="Ministerium für Wirtschaft, Industrie, Klimaschutz und Energie des Landes Nordrhein-Westfalen"
            src="/kio-assets/kio_logos_footer-Ministerium.svg"
          />
        </div>
      </div>
    </footer>
  );
}

export default Footer;
