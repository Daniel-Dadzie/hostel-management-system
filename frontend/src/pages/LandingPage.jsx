import { Link } from 'react-router-dom';
import { FaEnvelope, FaGlobe, FaPhoneAlt, FaSearch } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext.jsx';

const roomHighlights = [
  {
    title: 'Entertainment Zone',
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=700&q=80',
    description: 'Lounge-ready shared spaces designed for comfort, study, and social activities.'
  },
  {
    title: 'Best Rooms In Town',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=700&q=80',
    description: 'Neat interiors with quality bedding and practical storage for students.'
  },
  {
    title: 'Great Location',
    image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?auto=format&fit=crop&w=700&q=80',
    description: 'Located close to campus essentials with easy access to student services.'
  }
];

const galleryImages = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1505693314120-0d443867891c?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1616594039964-3f5d4b90f47d?auto=format&fit=crop&w=700&q=80',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=700&q=80'
];

export default function LandingPage() {
  const { isAuthenticated, role } = useAuth();
  const dashboardPath = role === 'ADMIN' ? '/admin' : '/student';

  return (
    <div className="min-h-screen bg-[#f2f2f2] text-neutral-800">
      <div className="border-b border-neutral-200 bg-[#f7f7f7] text-[10px] text-neutral-500">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2">
          <p className="inline-flex items-center gap-2"><FaPhoneAlt /> +233 20 123 4567</p>
          <p className="inline-flex items-center gap-2"><FaGlobe /> Language: ENGLISH</p>
        </div>
      </div>

      <header className="border-b border-neutral-300 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <nav className="hidden items-center gap-6 text-[11px] uppercase tracking-[0.18em] text-neutral-500 md:flex">
            <a href="#" className="hover:text-primary-700">Home</a>
            <a href="#" className="hover:text-primary-700">Features</a>
            <a href="#" className="hover:text-primary-700">Exterior</a>
            <a href="#" className="hover:text-primary-700">Blog</a>
            <a href="#" className="hover:text-primary-700">Typography</a>
          </nav>

          <div className="flex h-24 w-24 items-center justify-center bg-orange-500 text-center text-white shadow-sm">
            <div>
              <p className="text-4xl font-semibold leading-none">H</p>
              <p className="text-[9px] uppercase tracking-widest">Hot Hostel</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-[11px] uppercase tracking-[0.18em] text-neutral-500 md:flex">
            <a href="#" className="hover:text-primary-700">Rooms</a>
            <a href="#" className="hover:text-primary-700">Styles</a>
            <a href="#" className="hover:text-primary-700">Installations</a>
            <a href="#" className="hover:text-primary-700">About</a>
            <a href="#" className="hover:text-primary-700">Contact</a>
          </nav>
        </div>
      </header>

      <section className="relative">
        <img
          src="https://images.unsplash.com/photo-1555854877-bab0e460b7a5?auto=format&fit=crop&w=1500&q=80"
          alt="Hostel interior"
          className="h-[420px] w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20" />

        <div className="absolute inset-x-0 top-1/2 mx-auto max-w-4xl -translate-y-1/2 px-4 text-center">
          <div className="bg-orange-500/95 px-8 py-4.5 text-white shadow-lg">
            <h1 className="text-[44px] font-light leading-[1.08]">Comfortable Room Hostel of Your Dreams</h1>
            <p className="mt-1.5 text-[17px]">for less than the price of a hotel room</p>
          </div>

          <div className="mx-auto mt-4 grid grid-cols-2 overflow-hidden rounded-sm bg-white/95 text-left text-[11px] shadow-md md:grid-cols-6">
            {['Arrival', 'Departure', 'Rooms', 'Guest', 'Children'].map((field) => (
              <div key={field} className="border-r border-neutral-200 px-4 py-3">
                <p className="text-neutral-400">{field}</p>
                <p className="font-semibold text-neutral-700">--/--/----</p>
              </div>
            ))}
            <button type="button" className="flex items-center justify-center bg-neutral-700 text-white hover:bg-neutral-800">
              <FaSearch />
            </button>
          </div>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <h2 className="text-[52px] font-semibold tracking-tight text-neutral-800">
              Hot <span className="text-orange-500">Hostel</span> Budget Rooms
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {roomHighlights.map((item) => (
              <div key={item.title}>
                <img src={item.image} alt={item.title} className="h-40 w-full object-cover" />
                <h3 className="mt-4 text-[22px] font-semibold text-neutral-800">{item.title}</h3>
                <p className="mt-2 text-[14px] leading-7 text-neutral-500">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#c9bfb3] py-16 text-center text-white">
        <div className="mx-auto max-w-3xl px-4">
          <p className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/50 text-2xl">“</p>
          <p className="text-2xl font-light leading-9">
            Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium,
            totam rem aperiam, eaque ipsa quae ab illo.
          </p>
          <p className="mt-6 text-[11px] uppercase tracking-[0.2em] text-white/80">Jane Johnson, Hostel guest</p>
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-[50px] font-semibold tracking-tight text-neutral-800">Gallery</h2>
          <p className="mx-auto mt-2 max-w-2xl text-[14px] text-neutral-500">
            Explore our student-friendly rooms, shared spaces, and modern facilities.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {galleryImages.map((image, index) => (
              <figure key={image}>
                <img src={image} alt={`Gallery ${index + 1}`} className="h-32 w-full object-cover" />
                <figcaption className="mt-2 text-[10px] uppercase tracking-wide text-neutral-500">
                  Hostel Space {index + 1}
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-neutral-200 bg-[#f3f3f3]">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 text-[13px] text-neutral-500 md:grid-cols-4 md:gap-12 lg:gap-14">
          <div>
            <h3 className="mb-4 text-[12px] font-semibold uppercase tracking-wide text-neutral-700">Contact Info</h3>
            <p className="leading-6">University Hostel Lane<br />Campus Avenue, GH</p>
            <p className="mt-3 inline-flex items-center gap-2"><FaPhoneAlt /> +233 20 123 4567</p>
            <p className="mt-2 inline-flex items-center gap-2"><FaEnvelope /> info@hostel.com</p>
          </div>

          <div>
            <h3 className="mb-4 text-[12px] font-semibold uppercase tracking-wide text-neutral-700">Customer Support</h3>
            <p className="leading-6">FAQ<br />Help Desk<br />Payment Queries</p>
          </div>

          <div>
            <h3 className="mb-4 text-[12px] font-semibold uppercase tracking-wide text-neutral-700">Quick Links</h3>
            <p className="leading-6">Facilities<br />Policy<br />Terms</p>
          </div>

          <div>
            <h3 className="mb-4 text-[12px] font-semibold uppercase tracking-wide text-neutral-700">Get Started</h3>
            {isAuthenticated ? (
              <Link to={dashboardPath} className="inline-flex items-center rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600">
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex flex-col gap-2">
                <Link to="/register" className="inline-flex items-center rounded bg-orange-500 px-4 py-2 text-white hover:bg-orange-600">
                  Register
                </Link>
                <Link to="/login" className="inline-flex items-center rounded border border-neutral-300 px-4 py-2 text-neutral-700 hover:bg-neutral-100">
                  Login
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="bg-orange-500 py-2 text-center text-[11px] text-white">
          Copyright © {new Date().getFullYear()} Hot Hostel. Designed for university student housing.
        </div>
      </footer>
    </div>
  );
}
